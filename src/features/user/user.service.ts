// Refactored User Service - RBAC & Profile-based Architecture
import DB, { T } from "../../../database/index.schema";
import { Users } from "./user.interface";
import HttpException from "../../exceptions/HttpException";
import bcrypt from "bcrypt";
import { loadUserProfile } from "../../utils/user/profile-loader";
import { getUserRoles, hasRole, getUserPermissions as getRoleCheckerPermissions } from "../../utils/rbac/role-checker";

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
    const userRoles = await this.getUserRoles(user_id);
    const isClient = userRoles.some(role => role.name === 'CLIENT');

    // Separate client-specific fields from user table fields
    const clientFields = ['work_arrangement', 'project_frequency', 'hiring_preferences'];
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
        await DB(T.CLIENT_PROFILES)
          .where({ user_id })
          .update({
            ...clientData,
            updated_at: DB.fn.now()
          });
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
   * Get user roles with details
   */
  public async getUserRoles(user_id: number): Promise<any[]> {
    const roles = await DB(T.USER_ROLES)
      .join(`${T.ROLE} as r`, `${T.USER_ROLES}.role_id`, 'r.role_id')
      .where(`${T.USER_ROLES}.user_id`, user_id)
      .select('r.role_id', 'r.name', 'r.label', 'r.description');
    
    return roles;
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

  // Super Admin User Management Methods

  /**
   * Get all users with pagination and filtering
   */
  public async getAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }): Promise<any> {
    const { page, limit, search, role } = options;
    const offset = (page - 1) * limit;

    let query = DB(T.USERS_TABLE)
      .select(
        `${T.USERS_TABLE}.*`,
        DB.raw(`
          COALESCE(
            json_agg(
              json_build_object('role_id', r.role_id, 'name', r.name, 'label', r.label)
            ) FILTER (WHERE r.role_id IS NOT NULL), 
            '[]'::json
          ) as roles
        `)
      )
      .leftJoin(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .leftJoin(`${T.ROLE} as r`, `${T.USER_ROLES}.role_id`, `r.role_id`)
      .groupBy(`${T.USERS_TABLE}.user_id`);

    // Apply search filter
    if (search) {
      query = query.where(function() {
        this.where(`${T.USERS_TABLE}.first_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.last_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.email`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.username`, 'ilike', `%${search}%`);
      });
    }

    // Apply role filter
    if (role) {
      query = query.whereExists(function() {
        this.select('*')
          .from(T.USER_ROLES)
          .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
          .whereRaw(`${T.USER_ROLES}.user_id = ${T.USERS_TABLE}.user_id`)
          .where(`${T.ROLE}.name`, role);
      });
    }

    // Get total count
    const countQuery = DB(T.USERS_TABLE)
      .count('* as total')
      .leftJoin(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .leftJoin(`${T.ROLE} as r`, `${T.USER_ROLES}.role_id`, `r.role_id`);

    if (search) {
      countQuery.where(function() {
        this.where(`${T.USERS_TABLE}.first_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.last_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.email`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.username`, 'ilike', `%${search}%`);
      });
    }

    // Apply role filter to count query
    if (role) {
      countQuery.whereExists(function() {
        this.select('*')
          .from(T.USER_ROLES)
          .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
          .whereRaw(`${T.USER_ROLES}.user_id = ${T.USERS_TABLE}.user_id`)
          .where(`${T.ROLE}.name`, role);
      });
    }

    const [users, totalResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(`${T.USERS_TABLE}.created_at`, 'desc'),
      countQuery.first()
    ]);

    const total = parseInt(totalResult?.total as string) || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        ...user,
        password: undefined // Remove password from response
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Create new user (any type)
   */
  public async createUser(userData: any): Promise<any> {
    const { password, roleName, profileData, ...userInfo } = userData;

    // Check if user already exists
    const existingUser = await DB(T.USERS_TABLE).where({ email: userInfo.email }).first();
    if (existingUser) {
      throw new HttpException(409, 'User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const [user] = await DB(T.USERS_TABLE).insert({
      ...userInfo,
      password: hashedPassword,
      username: userInfo.username || userInfo.email.split('@')[0],
      is_active: true,
    }).returning('*');

    // Assign role if provided
    if (roleName) {
      await this.assignRoleToUser(user.user_id, roleName);
    }

    // Create profile based on role
    if (profileData && roleName) {
      await this.createUserProfile(user.user_id, roleName, profileData);
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Update user by ID
   */
  public async updateUserById(user_id: number, updateData: any): Promise<any> {
    const { password, ...otherData } = updateData;

    // Prepare update object
    const updateObj: any = { ...otherData };

    // Hash new password if provided
    if (password) {
      updateObj.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const [updatedUser] = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        ...updateObj,
        updated_at: DB.fn.now()
      })
      .returning('*');

    if (!updatedUser) {
      throw new HttpException(404, 'User not found');
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;
    return userResponse;
  }

  /**
   * Delete user permanently
   */
  public async deleteUserById(user_id: number): Promise<void> {
    const user = await this.getById(user_id);

    // Delete user (cascade will handle related records)
    await DB(T.USERS_TABLE).where({ user_id }).delete();
  }

  /**
   * Assign role to user
   */
  public async assignRoleToUser(user_id: number, roleName: string): Promise<void> {
    const { assignRole } = await import('../../utils/rbac/role-checker');
    await assignRole(user_id, roleName);
  }

  /**
   * Remove role from user
   */
  public async removeRoleFromUser(user_id: number, roleId: number): Promise<void> {
    await DB(T.USER_ROLES)
      .where({ user_id, role_id: roleId })
      .delete();
  }

  /**
   * Get user's permissions
   */
  public async getUserPermissions(user_id: number): Promise<string[]> {
    return await getRoleCheckerPermissions(user_id);
  }

  /**
   * Create user profile based on role
   */
  private async createUserProfile(user_id: number, roleName: string, profileData: any): Promise<void> {
    switch (roleName.toUpperCase()) {
      case 'CLIENT':
        await DB('client_profiles').insert({
          user_id,
          ...profileData
        });
        break;
      case 'VIDEOGRAPHER':
        const [freelancerProfile] = await DB('freelancer_profiles').insert({
          user_id,
          ...profileData
        }).returning('*');
        
        await DB('videographer_profiles').insert({
          profile_id: freelancerProfile.profile_id
        });
        break;
      case 'VIDEO_EDITOR':
        const [editorProfile] = await DB('freelancer_profiles').insert({
          user_id,
          ...profileData
        }).returning('*');
        
        await DB('videoeditor_profiles').insert({
          profile_id: editorProfile.profile_id
        });
        break;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        await DB(T.ADMIN_PROFILES).insert({
          user_id,
          ...profileData
        });
        break;
    }
  }
}

export default UserService;
