// src/features/admin-invites/admin-invites.service.ts

import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import DB, { T } from "../../../database/index";
import { INVITATION_TABLE } from "../../../database/admin_invites.schema";
import { IAdminInvite } from "./admin_invites.interface";
import {
  CreateAdminInviteDto,
  AdminInviteResponseDto,
  AcceptInviteDto,
} from "./admin-invites.dto";
import HttpException from "../../exceptions/HttpException";
import {
  createTransporter,
  EMAIL_SENDER,
  APP_NAME,
} from "../../utils/email/emailConfig";

class AdminInvitesService {
  /**
   * Create a new admin invitation
   */
  public async createInvite(
    dto: CreateAdminInviteDto,
    invitedBy: number
  ): Promise<AdminInviteResponseDto> {
    try {
      // Check if email already exists in users table
      const existingUser = await DB(T.USERS_TABLE)
        .where("email", dto.email)
        .first();
      if (existingUser) {
        throw new HttpException(400, "User with this email already exists");
      }

      // Check if there's already a pending invite for this email
      const existingInvite = await DB(INVITATION_TABLE)
        .where("email", dto.email)
        .first();

      if (existingInvite) {
        // If pending, throw error
        if (existingInvite.status === "pending") {
          throw new HttpException(
            400,
            "An invitation is already pending for this email"
          );
        }
        // If expired, revoked, or accepted - delete old record to allow new invite
        await DB(INVITATION_TABLE)
          .where("invitation_id", existingInvite.invitation_id)
          .delete();
      }

      // Generate secure token
      const inviteToken = crypto.randomBytes(32).toString("hex");

      // Set expiration (7 days from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create invitation record - Admin role is assigned by default
      const invitationId = await DB(INVITATION_TABLE)
        .insert({
          first_name: "",
          last_name: "",
          email: dto.email,
          invite_token: inviteToken,
          status: "pending",
          assigned_role: dto.assigned_role || "ADMIN", // Default to ADMIN if not specified
          password: null,
          invited_by: invitedBy,
          expires_at: expiresAt,
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
        })
        .returning("invitation_id");

      // Send invitation email
      await this.sendInvitationEmail(dto.email, inviteToken, invitedBy);

      // Return the created invitation
      const invitation = await DB(INVITATION_TABLE)
        .where("invitation_id", invitationId[0].invitation_id)
        .first();

      return this.mapToResponseDto(invitation);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accept an invitation
   */
  public async acceptInvite(
    dto: AcceptInviteDto
  ): Promise<{ message: string; user_id: number }> {
    try {
      // Find the invitation by token
      const invitation = await DB(INVITATION_TABLE)
        .where("invite_token", dto.token)
        .where("status", "pending")
        .first();

      if (!invitation) {
        throw new HttpException(404, "Invalid or expired invitation token");
      }

      // Check if invitation has expired
      if (new Date() > new Date(invitation.expires_at)) {
        await DB(INVITATION_TABLE)
          .where("invitation_id", invitation.invitation_id)
          .update({ status: "expired", updated_at: new Date() });
        throw new HttpException(400, "Invitation has expired");
      }

      // Start transaction
      const trx = await DB.transaction();

      try {
        // Create the user account
        const username =
          invitation.email.split("@")[0] +
          Math.random().toString(36).substring(2, 8);
        const userResult = await trx(T.USERS_TABLE)
          .insert({
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            username: username,
            email: invitation.email,
            password: dto.new_password
              ? await bcrypt.hash(dto.new_password, 12)
              : invitation.password,
            is_active: true,
            is_banned: false,
            email_verified: true, // Since they accepted the invite
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning("user_id");

        const userId = userResult[0].user_id; // Assign role if specified
        if (invitation.assigned_role) {
          const role = await trx(T.ROLE)
            .where("name", invitation.assigned_role)
            .first();

          if (role) {
            await trx(T.USER_ROLES).insert({
              user_id: userId,
              role_id: role.role_id,
            });
          }
        }

        // Update invitation status
        await trx(INVITATION_TABLE)
          .where("invitation_id", invitation.invitation_id)
          .update({
            status: "accepted",
            accepted_at: new Date(),
            updated_at: new Date(),
          });

        await trx.commit();

        return {
          message: "Invitation accepted successfully. Welcome to the platform!",
          user_id: userId,
        };
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all invitations (for admin)
   */
  public async getAllInvites(): Promise<AdminInviteResponseDto[]> {
    try {
      const invites = await DB(INVITATION_TABLE)
        .where("is_deleted", false)
        .orderBy("created_at", "desc");

      return invites.map((invite) => this.mapToResponseDto(invite));
    } catch (error) {
      throw new HttpException(500, "Error fetching invitations");
    }
  }

  /**
   * Revoke an invitation
   */
  public async revokeInvite(invitationId: number): Promise<void> {
    try {
      const updated = await DB(INVITATION_TABLE)
        .where("invitation_id", invitationId)
        .where("status", "pending")
        .update({
          status: "revoked",
          updated_at: new Date(),
        });

      if (updated === 0) {
        throw new HttpException(
          404,
          "Invitation not found or already processed"
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify invitation token
   */
  public async verifyToken(
    token: string
  ): Promise<{ email: string; expires_at: string }> {
    try {
      const invitation = await DB(INVITATION_TABLE)
        .where("invite_token", token)
        .where("status", "pending")
        .first();

      if (!invitation) {
        throw new HttpException(404, "Invalid or expired invitation token");
      }

      // Check if invitation has expired
      if (new Date() > new Date(invitation.expires_at)) {
        await DB(INVITATION_TABLE)
          .where("invitation_id", invitation.invitation_id)
          .update({ status: "expired", updated_at: new Date() });
        throw new HttpException(400, "Invitation has expired");
      }

      return {
        email: invitation.email,
        expires_at: invitation.expires_at,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete registration
   */
  public async completeRegistration(
    dto: any
  ): Promise<{ user: any; token: string }> {
    try {
      // Validate token
      const invitation = await DB(INVITATION_TABLE)
        .where("invite_token", dto.token)
        .where("status", "pending")
        .first();

      if (!invitation) {
        throw new HttpException(404, "Invalid or expired invitation token");
      }

      // Check if invitation has expired
      if (new Date() > new Date(invitation.expires_at)) {
        await DB(INVITATION_TABLE)
          .where("invitation_id", invitation.invitation_id)
          .update({ status: "expired", updated_at: new Date() });
        throw new HttpException(400, "Invitation has expired");
      }

      // Validate email matches invitation
      if (dto.email !== invitation.email) {
        throw new HttpException(400, "Email does not match invitation");
      }

      // Validate password match
      if (dto.password !== dto.confirm_password) {
        throw new HttpException(400, "Passwords do not match");
      }

      // Check if user already exists
      const existingUser = await DB(T.USERS_TABLE)
        .where("email", dto.email)
        .first();
      if (existingUser) {
        throw new HttpException(400, "User with this email already exists");
      }

      // Start transaction
      const trx = await DB.transaction();

      try {
        // Create the user account
        const username =
          dto.email.split("@")[0] + Math.random().toString(36).substring(2, 8);
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const userResult = await trx(T.USERS_TABLE)
          .insert({
            first_name: dto.first_name,
            last_name: dto.last_name,
            username: username,
            email: dto.email,
            password: hashedPassword,
            is_active: true,
            is_banned: false,
            email_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning("user_id");

        const userId = userResult[0].user_id;

        // Assign ADMIN role
        const role = await trx(T.ROLE).where("name", "ADMIN").first();

        if (role) {
          await trx(T.USER_ROLES).insert({
            user_id: userId,
            role_id: role.role_id,
          });
        }

        // Create admin profile
        await trx("admin_profiles").insert({
          user_id: userId,
        });

        // Update invitation status
        await trx(INVITATION_TABLE)
          .where("invitation_id", invitation.invitation_id)
          .update({
            status: "accepted",
            accepted_at: new Date(),
            updated_at: new Date(),
          });

        await trx.commit();

        // Generate JWT token
        const jwt = require("jsonwebtoken");
        const token = jwt.sign(
          {
            id: userId,
            user_id: userId,
            email: dto.email,
            roles: ["ADMIN"],
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        // Get full user data
        const user = await DB(T.USERS_TABLE)
          .where("user_id", userId)
          .select("user_id", "email", "first_name", "last_name", "username")
          .first();

        return {
          user: {
            ...user,
            roles: ["ADMIN"],
          },
          token,
        };
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send invitation email
   */
  private async sendInvitationEmail(
    email: string,
    token: string,
    invitedBy: number
  ): Promise<void> {
    try {
      const inviter = await DB(T.USERS_TABLE)
        .where("user_id", invitedBy)
        .select("first_name", "last_name", "email")
        .first();

      const inviteUrl = `${process.env.ADMIN_PANEL_URL}/register?token=${token}`;

      const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>You're Invited to Join MMV Admin Panel!</h2>
                    <p>Hello,</p>
                    <p>You've been invited to join the MMV Admin Panel by ${inviter?.first_name} ${inviter?.last_name}.</p>
                    <p>Click the button below to accept your invitation and create your account:</p>
                    <p style="margin: 20px 0;">
                        <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Accept Invitation & Register
                        </a>
                    </p>
                    <p><strong>Important:</strong> This invitation will expire in 24 hours.</p>
                    <p>You will be able to set up your account details during registration.</p>
                    <p>If you have any questions, please contact the administrator.</p>
                    <p>Best regards,<br>The MMV Team</p>
                </div>
            `;

      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"${APP_NAME}" <${EMAIL_SENDER}>`,
        to: email,
        subject: `You're Invited to Join ${APP_NAME} Admin Panel`,
        html: emailHtml,
      });
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      // Don't throw here - invitation was created successfully, just email failed
    }
  }

  /**
   * Map database row to response DTO
   */
  private mapToResponseDto(invite: any): AdminInviteResponseDto {
    return {
      invitation_id: invite.invitation_id,
      email: invite.email,
      status: invite.status,
      invited_by: invite.invited_by,
      expires_at: invite.expires_at,
      created_at: invite.created_at,
      updated_at: invite.updated_at,
    };
  }
}

export default AdminInvitesService;
