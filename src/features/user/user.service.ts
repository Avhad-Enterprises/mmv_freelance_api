// Refactored User Service - RBAC & Profile-based Architecture
import DB, { T } from "../../../database/index.schema";
import { Users } from "./user.interface";
import HttpException from "../../exceptions/HttpException";
import bcrypt from "bcrypt";
import { loadUserProfile } from "../../utils/user/profile-loader";
import { getUserRoles, hasRole } from "../../utils/rbac/role-checker";

/**
 * Base User Service
 * Handles common user operations across all user types
 * Uses RBAC system and profile loading utilities
 */
class UserService {
  
  /**
   * Get user by ID with their profile loaded
   * Automatically loads the appropriate profile based on user's role
   */
  public async getUserWithProfile(user_id: number): Promise<any> {
    const result = await loadUserProfile(user_id);
    
    if (!result) {
      throw new HttpException(404, "User not found");
    }
    
    return result;
  }

  /**
   * Get basic user info without profile
   */
  public async getById(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return user;
  }

  /**
   * Get all users with a specific role
   */
  public async getUsersByRole(roleName: string): Promise<Users[]> {
    const users = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .where(`${T.ROLE}.name`, roleName)
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(`${T.USERS_TABLE}.*`)
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return users;
  }

  /**
   * Get all active clients
   */
  public async getAllActiveClients(): Promise<Users[]> {
    return this.getUsersByRole('CLIENT');
  }

  /**
   * Get all active videographers
   */
  public async getAllActiveVideographers(): Promise<Users[]> {
    return this.getUsersByRole('VIDEOGRAPHER');
  }

  /**
   * Get all active video editors
   */
  public async getAllActiveVideoEditors(): Promise<Users[]> {
    return this.getUsersByRole('VIDEO_EDITOR');
  }

  /**
   * Get all active freelancers (videographers + video editors)
   */
  public async getAllActiveFreelancers(): Promise<Users[]> {
    const users = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .whereIn(`${T.ROLE}.name`, ['VIDEOGRAPHER', 'VIDEO_EDITOR'])
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(`${T.USERS_TABLE}.*`)
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return users;
  }

  /**
   * Update user basic info (fields in users table only)
   */
  public async updateBasicInfo(user_id: number, data: Partial<Users>): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({ 
        ...data, 
        updated_at: DB.fn.now() 
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Soft delete user
   */
  public async softDelete(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        is_active: false,
        is_deleted: true,
        updated_at: DB.fn.now()
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Ban user
   */
  public async banUser(user_id: number, reason?: string): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        is_banned: true,
        banned_reason: reason || 'Banned by admin',
        updated_at: DB.fn.now()
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Unban user
   */
  public async unbanUser(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        is_banned: false,
        banned_reason: null,
        updated_at: DB.fn.now()
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<Users | null> {
    return await DB(T.USERS_TABLE)
      .where({ email })
      .first();
  }

  /**
   * Get user by username
   */
  public async getUserByUsername(username: string): Promise<Users | null> {
    return await DB(T.USERS_TABLE)
      .where({ username })
      .first();
  }

  /**
   * Change password
   */
  public async changePassword(
    user_id: number, 
    oldPassword: string, 
    newPassword: string
  ): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({ 
        password: hashedNewPassword, 
        updated_at: DB.fn.now() 
      });
  }

  /**
   * Save password reset token
   */
  public async saveResetToken(
    user_id: number, 
    token: string, 
    expires: Date
  ): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        reset_token: token,
        reset_token_expires: expires,
      });
  }

  /**
   * Reset password using token
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ reset_token: token })
      .andWhere('reset_token_expires', '>', DB.fn.now())
      .first();

    if (!user) {
      throw new HttpException(400, "Invalid or expired token");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id: user.user_id })
      .update({
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
        updated_at: DB.fn.now(),
      });
  }

  /**
   * Verify email
   */
  public async verifyEmail(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        email_verified: true,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Verify phone
   */
  public async verifyPhone(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        phone_verified: true,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Check if user has specific role
   */
  public async userHasRole(user_id: number, roleName: string): Promise<boolean> {
    return await hasRole(user_id, roleName);
  }

  /**
   * Get user roles
   */
  public async getUserRoles(user_id: number): Promise<string[]> {
    return await getUserRoles(user_id);
  }

  /**
   * Check if user has any profile
   */
  public async userHasProfile(user_id: number): Promise<boolean> {
    // Check if user has any profile in profile tables
    const clientProfile = await DB(T.CLIENT_PROFILES).where({ user_id }).first();
    if (clientProfile) return true;
    
    const freelancerProfile = await DB(T.FREELANCER_PROFILES).where({ user_id }).first();
    if (freelancerProfile) return true;
    
    const adminProfile = await DB(T.ADMIN_PROFILES).where({ user_id }).first();
    if (adminProfile) return true;
    
    return false;
  }

  /**
   * Update last login time
   */
  public async updateLastLogin(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        last_login_at: DB.fn.now()
      });
  }

  /**
   * Increment login attempts
   */
  public async incrementLoginAttempts(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .increment('login_attempts', 1);
  }

  /**
   * Reset login attempts
   */
  public async resetLoginAttempts(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        login_attempts: 0
      });
  }
}

export default UserService;
