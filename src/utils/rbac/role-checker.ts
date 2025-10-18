// RBAC Helper: Check user roles and permissions
// Utility functions for role-based access control

import DB from '../../../database/index';
import { ROLE } from '../../../database/role.schema';
import { PERMISSION } from '../../../database/permission.schema';
import { USER_ROLES } from '../../../database/user_role.schema';
import { ROLE_PERMISSION } from '../../../database/role_permission.schema';

/**
 * Get all roles for a user
 */
export const getUserRoles = async (userId: number): Promise<string[]> => {
  const roles = await DB(USER_ROLES)
    .join(ROLE, `${ROLE}.role_id`, `${USER_ROLES}.role_id`)
    .where(`${USER_ROLES}.user_id`, userId)
    .select(`${ROLE}.name`);
  
  return roles.map((r: any) => r.name);
};

/**
 * Get all permissions for a user (through their roles)
 */
export const getUserPermissions = async (userId: number): Promise<string[]> => {
  const permissions = await DB(USER_ROLES)
    .join(ROLE, `${ROLE}.role_id`, `${USER_ROLES}.role_id`)
    .join(ROLE_PERMISSION, `${ROLE_PERMISSION}.role_id`, `${ROLE}.role_id`)
    .join(PERMISSION, `${PERMISSION}.permission_id`, `${ROLE_PERMISSION}.permission_id`)
    .where(`${USER_ROLES}.user_id`, userId)
    .distinct(`${PERMISSION}.name`);
  
  return permissions.map((p: any) => p.name);
};

/**
 * Check if user has specific role
 */
export const hasRole = async (userId: number, roleName: string): Promise<boolean> => {
  const roles = await getUserRoles(userId);
  return roles.includes(roleName);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = async (userId: number, roleNames: string[]): Promise<boolean> => {
  const roles = await getUserRoles(userId);
  return roleNames.some(role => roles.includes(role));
};

/**
 * Check if user has all specified roles
 */
export const hasAllRoles = async (userId: number, roleNames: string[]): Promise<boolean> => {
  const roles = await getUserRoles(userId);
  return roleNames.every(role => roles.includes(role));
};

/**
 * Check if user has specific permission
 */
export const hasPermission = async (userId: number, permissionName: string): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionName);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = async (userId: number, permissionNames: string[]): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissionNames.some(perm => permissions.includes(perm));
};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = async (userId: number, permissionNames: string[]): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissionNames.every(perm => permissions.includes(perm));
};

/**
 * Assign role to user
 */
export const assignRole = async (userId: number, roleName: string): Promise<void> => {
  const role = await DB(ROLE).where({ name: roleName }).first();
  
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  // Check if already assigned
  const existing = await DB(USER_ROLES)
    .where({ user_id: userId, role_id: role.role_id })
    .first();

  if (!existing) {
    await DB(USER_ROLES).insert({
      user_id: userId,
      role_id: role.role_id,
    });
  }
};

/**
 * Remove role from user
 */
export const removeRole = async (userId: number, roleName: string): Promise<void> => {
  const role = await DB(ROLE).where({ name: roleName }).first();
  
  if (role) {
    await DB(USER_ROLES)
      .where({ user_id: userId, role_id: role.role_id })
      .delete();
  }
};
