// Permission-based Access Control Middleware
// Usage: requirePermission('projects.create', 'projects.update')

import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
import HttpException from '../exceptions/HttpException';
import DB from '../../database/index';
import { ROLE } from '../../database/role.schema';
import { PERMISSION } from '../../database/permission.schema';
import { USER_ROLES } from '../../database/user_role.schema';
import { ROLE_PERMISSION } from '../../database/role_permission.schema';

/**
 * Middleware to check if user has required permission(s)
 * @param permissions - Array of permission names (e.g., ['projects.create'])
 */
export const requirePermission = (...permissions: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, 'Authentication required');
      }

      // Get user's permissions through their roles
      const userPermissions = await DB(USER_ROLES)
        .join(ROLE, `${ROLE}.role_id`, `${USER_ROLES}.role_id`)
        .join(ROLE_PERMISSION, `${ROLE_PERMISSION}.role_id`, `${ROLE}.role_id`)
        .join(PERMISSION, `${PERMISSION}.permission_id`, `${ROLE_PERMISSION}.permission_id`)
        .where(`${USER_ROLES}.user_id`, req.user.user_id)
        .select(`${PERMISSION}.name`);

      const userPermissionNames = userPermissions.map((p: any) => p.name);

      // Check if user has any of the required permissions
      const hasPermission = permissions.some(perm => userPermissionNames.includes(perm));

      if (!hasPermission) {
        throw new HttpException(403, `Access denied. Required permission: ${permissions.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has ALL specified permissions
 * @param permissions - Array of permission names
 */
export const requireAllPermissions = (...permissions: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, 'Authentication required');
      }

      const userPermissions = await DB(USER_ROLES)
        .join(ROLE, `${ROLE}.role_id`, `${USER_ROLES}.role_id`)
        .join(ROLE_PERMISSION, `${ROLE_PERMISSION}.role_id`, `${ROLE}.role_id`)
        .join(PERMISSION, `${PERMISSION}.permission_id`, `${ROLE_PERMISSION}.permission_id`)
        .where(`${USER_ROLES}.user_id`, req.user.user_id)
        .select(`${PERMISSION}.name`);

      const userPermissionNames = userPermissions.map((p: any) => p.name);

      // Check if user has ALL required permissions
      const hasAllPermissions = permissions.every(perm => userPermissionNames.includes(perm));

      if (!hasAllPermissions) {
        throw new HttpException(403, `Access denied. Required permissions: ${permissions.join(' and ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
