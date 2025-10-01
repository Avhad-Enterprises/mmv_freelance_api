// RBAC Middleware: Role-based Access Control
// Usage: requireRole('CLIENT', 'ADMIN')

import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
import HttpException from '../exceptions/HttpException';
import DB from '../../database/index.schema';
import { ROLE } from '../../database/role.schema';
import { USER_ROLES } from '../../database/user_role.schema';

/**
 * Middleware to check if user has required role(s)
 * @param roles - Array of role names (e.g., ['CLIENT', 'ADMIN'])
 */
export const requireRole = (...roles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, 'Authentication required');
      }

      // Get user's roles
      const userRoles = await DB(USER_ROLES)
        .join(ROLE, `${ROLE}.role_id`, `${USER_ROLES}.role_id`)
        .where(`${USER_ROLES}.user_id`, req.user.user_id)
        .select(`${ROLE}.name`);

      const userRoleNames = userRoles.map((r: any) => r.name);

      // Check if user has any of the required roles
      const hasRole = roles.some(role => userRoleNames.includes(role));

      if (!hasRole) {
        throw new HttpException(403, `Access denied. Required role: ${roles.join(' or ')}`);
      }

      // Attach roles to request for further use
      req.user.roles = userRoleNames;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has ALL specified roles
 * @param roles - Array of role names
 */
export const requireAllRoles = (...roles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, 'Authentication required');
      }

      const userRoles = await DB(USER_ROLES)
        .join(ROLE, `${ROLE}.role_id`, `${USER_ROLES}.role_id`)
        .where(`${USER_ROLES}.user_id`, req.user.user_id)
        .select(`${ROLE}.name`);

      const userRoleNames = userRoles.map((r: any) => r.name);

      // Check if user has ALL required roles
      const hasAllRoles = roles.every(role => userRoleNames.includes(role));

      if (!hasAllRoles) {
        throw new HttpException(403, `Access denied. Required roles: ${roles.join(' and ')}`);
      }

      req.user.roles = userRoleNames;
      next();
    } catch (error) {
      next(error);
    }
  };
};
