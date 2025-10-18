// User Role Service
// Handles role and permission operations
import DB, { T } from "../../../database/index";
import { getUserRoles, hasRole, getUserPermissions as getRoleCheckerPermissions } from "../../utils/rbac/role-checker";

/**
 * User Role Service
 * Handles role and permission operations
 */
class UserRoleService {

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
   * Get user's permissions
   */
  public async getUserPermissions(user_id: number): Promise<string[]> {
    return await getRoleCheckerPermissions(user_id);
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
   * Get all users by role
   */
  public async getUsersByRole(roleName: string): Promise<any[]> {
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
  public async getAllActiveClients(): Promise<any[]> {
    return this.getUsersByRole('CLIENT');
  }

  /**
   * Get all active videographers
   */
  public async getAllActiveVideographers(): Promise<any[]> {
    return this.getUsersByRole('VIDEOGRAPHER');
  }

  /**
   * Get all active video editors
   */
  public async getAllActiveVideoEditors(): Promise<any[]> {
    return this.getUsersByRole('VIDEO_EDITOR');
  }

  /**
   * Get all active freelancers (videographers + video editors)
   */
  public async getAllActiveFreelancers(): Promise<any[]> {
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
}

export default UserRoleService;