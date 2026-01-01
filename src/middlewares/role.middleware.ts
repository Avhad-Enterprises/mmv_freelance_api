// RBAC Middleware: Role-based Access Control
// Usage: requireRole('CLIENT', 'ADMIN')

import { NextFunction, Response } from "express";
import { RequestWithUser } from "../interfaces/auth.interface";
import HttpException from "../exceptions/HttpException";
import DB from "../../database/index";
import { ROLE } from "../../database/role.schema";
import { USER_ROLES } from "../../database/user_role.schema";

/**
 * Middleware to check if user has required role(s)
 * @param roles - Array of role names (e.g., ['CLIENT', 'ADMIN'])
 */
export const requireRole = (...roles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, "Authentication required");
      }

      // Use roles from JWT (attached by auth middleware)
      const userRoleNames = req.user.roles || [];

      // Check if user has any of the required roles
      const hasRole = roles.some((role) => userRoleNames.includes(role));

      if (!hasRole) {
        throw new HttpException(
          403,
          `Access denied. Required role: ${roles.join(" or ")}`
        );
      }

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
        throw new HttpException(401, "Authentication required");
      }

      const userRoleNames = req.user.roles || [];

      // Check if user has ALL required roles
      const hasAllRoles = roles.every((role) => userRoleNames.includes(role));

      if (!hasAllRoles) {
        throw new HttpException(
          403,
          `Access denied. Required roles: ${roles.join(" and ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is accessing their own resource OR has admin role
 * @param roles - Array of admin role names (e.g., ['ADMIN', 'SUPER_ADMIN'])
 */
export const requireSelfOrRole = (...roles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, "Authentication required");
      }

      const requestedUserId = parseInt(req.params.id);
      const currentUserId = req.user.user_id;
      const userRoleNames = req.user.roles || [];

      // Allow if user is accessing their own resource
      if (requestedUserId === currentUserId) {
        return next();
      }

      // Or if user has one of the required admin roles
      const hasRole = roles.some((role) => userRoleNames.includes(role));
      if (hasRole) {
        return next();
      }

      throw new HttpException(
        403,
        `Access denied. You can only access your own profile or need role: ${roles.join(
          " or "
        )}`
      );
    } catch (error) {
      next(error);
    }
  };
};
