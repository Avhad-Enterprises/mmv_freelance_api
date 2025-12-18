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

    // Update users table with provided fields
    if (Object.keys(data).length > 0) {
      const updated = await DB(T.USERS_TABLE)
        .where({ user_id })
        .update({
          ...data,
          updated_at: DB.fn.now()
        })
        .returning("*");

      return updated[0];
    }

    // If no fields were updated, return the original user
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

  public async setPassword(user_id: number, newPassword: string) {
    return this.authService.setPassword(user_id, newPassword);
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
   * Get profile completion status for a user
   */
  public async getProfileCompletion(userId: number): Promise<{
    completed: number;
    total: number;
    percentage: number;
    completedFields: string[];
    missingFields: string[];
  }> {
    const userProfile = await this.getUserWithProfile(userId);
    const roles = await this.roleService.getUserRoles(userId);

    // Extract role names from roles array
    const roleNames = roles.map((role: any) => role.name);

    // Determine user type
    let userType: string | null = null;
    if (roleNames.includes('CLIENT')) {
      userType = 'CLIENT';
    } else if (roleNames.includes('VIDEOGRAPHER')) {
      userType = 'VIDEOGRAPHER';
    } else if (roleNames.includes('VIDEO_EDITOR')) {
      userType = 'VIDEO_EDITOR';
    } else if (roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN')) {
      userType = 'ADMIN';
    }

    if (!userType) {
      return {
        completed: 0,
        total: 0,
        percentage: 0,
        completedFields: [],
        missingFields: []
      };
    }

    // Define completion criteria for each user type
    const completionCriteria = this.getCompletionCriteria(userType);

    // Calculate completion
    const { completed, total, completedFields, missingFields } = this.calculateCompletion(
      userProfile,
      completionCriteria
    );

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage,
      completedFields,
      missingFields
    };
  }

  /**
 * Get completion criteria for different user types
 */
  private getCompletionCriteria(userType: string): { [key: string]: string[] } {
    const criteria = {
      CLIENT: {
        user: ['first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'pincode', 'terms_accepted', 'privacy_policy_accepted'],
        profile: ['company_name', 'company_description', 'industry', 'company_size', 'work_arrangement', 'project_frequency', 'hiring_preferences']
      },
      VIDEOGRAPHER: {
        user: ['first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'pincode'],
        freelancer_profile: ['profile_title', 'short_description', 'experience_level', 'skills', 'languages', 'rate_amount', 'currency', 'availability', 'work_type', 'hours_per_week', 'portfolio_links']
        // videographer_profile: [] - currently empty
      },
      VIDEO_EDITOR: {
        user: ['first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'pincode'],
        freelancer_profile: ['profile_title', 'short_description', 'experience_level', 'skills', 'languages', 'rate_amount', 'currency', 'availability', 'work_type', 'hours_per_week', 'portfolio_links']
        // videoeditor_profile: [] - currently empty
      },
      ADMIN: {
        user: ['first_name', 'last_name', 'email', 'phone_number']
      }
    };

    return criteria[userType] || {};
  }

  /**
   * Calculate completion based on criteria
   */
  private calculateCompletion(userProfile: any, criteria: { [key: string]: string[] }): {
    completed: number;
    total: number;
    completedFields: string[];
    missingFields: string[];
  } {
    let completed = 0;
    let total = 0;
    const completedFields: string[] = [];
    const missingFields: string[] = [];

    // Check user fields
    if (criteria.user) {
      criteria.user.forEach(field => {
        total++;
        if (userProfile.user && userProfile.user[field] && userProfile.user[field] !== '') {
          completed++;
          completedFields.push(`user.${field}`);
        } else {
          missingFields.push(`user.${field}`);
        }
      });
    }

    // Check profile fields
    if (criteria.profile && userProfile.profile) {
      criteria.profile.forEach(field => {
        total++;
        if (userProfile.profile[field] && userProfile.profile[field] !== '' && userProfile.profile[field] !== false) {
          completed++;
          completedFields.push(`profile.${field}`);
        } else {
          missingFields.push(`profile.${field}`);
        }
      });
    }

    // Check freelancer profile fields
    if (criteria.freelancer_profile && userProfile.profile) {
      criteria.freelancer_profile.forEach(field => {
        total++;
        const value = userProfile.profile[field];
        if (value && value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true) &&
          (typeof value === 'number' ? value > 0 : true)) {
          completed++;
          completedFields.push(`freelancer_profile.${field}`);
        } else {
          missingFields.push(`freelancer_profile.${field}`);
        }
      });
    }

    // Note: videographer_profile and videoeditor_profile are currently empty
    // When they get fields added, uncomment and update the logic below
    /*
    // Check specific profile fields (videographer/videoeditor)
    const specificProfileKey = userProfile.profile?.videographer ? 'videographer_profile' : 
                              userProfile.profile?.videoeditor ? 'videoeditor_profile' : null;
    
    if (specificProfileKey && criteria[specificProfileKey]) {
      const specificProfile = userProfile.profile.videographer || userProfile.profile.videoeditor;
      criteria[specificProfileKey].forEach(field => {
        total++;
        const value = specificProfile?.[field];
        if (value && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
          completed++;
          completedFields.push(`${specificProfileKey}.${field}`);
        } else {
          missingFields.push(`${specificProfileKey}.${field}`);
        }
      });
    }
    */

    return { completed, total, completedFields, missingFields };
  }
}

export default UserService;
