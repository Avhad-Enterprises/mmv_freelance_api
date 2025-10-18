// Refactored User Service - Core operations with modular services
import DB, { T } from "../../../database/index";
import { Users } from "./user.interface";
import HttpException from "../../exceptions/HttpException";
import bcrypt from "bcrypt";
import { loadUserProfile } from "../../utils/user/profile-loader";
import { isEmpty } from "../../utils/common";
import { UsersDto } from "./user.dto";

// Import specialized services
import UserAuthService from "./user.auth.service";
import UserAdminService from "./user.admin.service";
import UserProfileService from "./user.profile.service";
import UserRoleService from "./user.role.service";

/**
 * Base User Service
 * Handles core user operations using specialized service modules
 * Uses RBAC system and profile loading utilities
 */
class UserService {
  // Service instances
  private authService = new UserAuthService();
  private adminService = new UserAdminService();
  private profileService = new UserProfileService();
  private roleService = new UserRoleService();

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
   * Update user basic info (fields in users table and profile tables)
   */
  public async updateBasicInfo(user_id: number, data: Partial<Users>): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Get user roles to determine which profile table to update
    const userRoles = await this.roleService.getUserRoles(user_id);
    const isClient = userRoles.some(role => role.name === 'CLIENT');

    // Separate client-specific fields from user table fields
    const clientFields = ['work_arrangement', 'project_frequency', 'hiring_preferences', 'website', 'social_links'];
    const clientData: any = {};
    const userData: any = { ...data };

    if (isClient) {
      clientFields.forEach(field => {
        if (userData[field] !== undefined) {
          clientData[field] = userData[field];
          delete userData[field];
        }
      });

      // Update client profile if there are client-specific fields
      if (Object.keys(clientData).length > 0) {
        await this.profileService.updateClientProfile(user_id, clientData);
      }
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Update users table with remaining fields
    if (Object.keys(userData).length > 0) {
      const updated = await DB(T.USERS_TABLE)
        .where({ user_id })
        .update({
          ...userData,
          updated_at: DB.fn.now()
        })
        .returning("*");

      return updated[0];
    }

    // If only profile fields were updated, return the original user
    return user;
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

  // Delegate authentication operations to auth service
  public async getUserByEmail(email: string) {
    return this.authService.getUserByEmail(email);
  }

  public async getUserByUsername(username: string) {
    return this.authService.getUserByUsername(username);
  }

  public async changePassword(user_id: number, oldPassword: string, newPassword: string) {
    return this.authService.changePassword(user_id, oldPassword, newPassword);
  }

  public async saveResetToken(user_id: number, token: string, expires: Date) {
    return this.authService.saveResetToken(user_id, token, expires);
  }

  public async resetPassword(token: string, newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }

  public async verifyEmail(user_id: number) {
    return this.authService.verifyEmail(user_id);
  }

  public async verifyPhone(user_id: number) {
    return this.authService.verifyPhone(user_id);
  }

  public async updateLastLogin(user_id: number) {
    return this.authService.updateLastLogin(user_id);
  }

  public async incrementLoginAttempts(user_id: number) {
    return this.authService.incrementLoginAttempts(user_id);
  }

  public async resetLoginAttempts(user_id: number) {
    return this.authService.resetLoginAttempts(user_id);
  }

  // Delegate role operations to role service
  public async userHasRole(user_id: number, roleName: string) {
    return this.roleService.userHasRole(user_id, roleName);
  }

  public async getUserRoles(user_id: number) {
    return this.roleService.getUserRoles(user_id);
  }

  public async getUserPermissions(user_id: number) {
    return this.roleService.getUserPermissions(user_id);
  }

  public async assignRoleToUser(user_id: number, roleName: string) {
    return this.roleService.assignRoleToUser(user_id, roleName);
  }

  public async removeRoleFromUser(user_id: number, roleId: number) {
    return this.roleService.removeRoleFromUser(user_id, roleId);
  }

  public async getUsersByRole(roleName: string) {
    return this.roleService.getUsersByRole(roleName);
  }

  public async getAllActiveClients() {
    return this.roleService.getAllActiveClients();
  }

  public async getAllActiveVideographers() {
    return this.roleService.getAllActiveVideographers();
  }

  public async getAllActiveVideoEditors() {
    return this.roleService.getAllActiveVideoEditors();
  }

  public async getAllActiveFreelancers() {
    return this.roleService.getAllActiveFreelancers();
  }

  // Delegate profile operations to profile service
  public async userHasProfile(user_id: number) {
    return this.profileService.userHasProfile(user_id);
  }

  // Delegate admin operations to admin service
  public async getAllUsers(options: any) {
    return this.adminService.getAllUsers(options);
  }

  public async createUser(userData: any) {
    return this.adminService.createUser(userData);
  }

  public async updateUserById(user_id: number, updateData: any) {
    return this.adminService.updateUserById(user_id, updateData);
  }

  public async deleteUserById(user_id: number) {
    return this.adminService.deleteUserById(user_id);
  }

  /**
   * Create user invitation
   */
  public async createuserInvitation(data: UsersDto): Promise<Users> {
    if (!data.username || !data.password || !data.email || !data.phone_number || !data.full_name) {
      throw new HttpException(400, "Missing required fields");
    }
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");

    // Split full_name into first_name and last_name
    const nameParts = data.full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || first_name;

    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();

    if (existingEmployee)
      throw new HttpException(409, "Email already registered");

    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();

      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user data object with correct fields
    const userData = {
      first_name,
      last_name,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phone_number: data.phone_number
    };

    const res = await DB(T.USERS_TABLE).insert(userData).returning("*");
    return res[0];
  }
}

export default UserService;
