// Permission-based Access Control Middleware
// Usage: requirePermission('projects.create', 'projects.update')

import { NextFunction, Response } from "express";
import { RequestWithUser } from "../interfaces/auth.interface";
import HttpException from "../exceptions/HttpException";
import DB from "../../database/index";
import { ROLE } from "../../database/role.schema";
import { PERMISSION } from "../../database/permission.schema";
import { USER_ROLES } from "../../database/user_role.schema";
import { ROLE_PERMISSION } from "../../database/role_permission.schema";

/**
 * Middleware to check if user has required permission(s)
 * @param permissions - Array of permission names (e.g., ['projects.create'])
 */
export const requirePermission = (...permissions: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.user_id) {
        throw new HttpException(401, "Authentication required");
      }

      // 1. Super Admin Bypass (God Mode)
      if (req.user.roles && req.user.roles.includes("SUPER_ADMIN")) {
        return next();
      }

      // 2. JWT Permission Check (Zero-Latency)
      // Permissions are now embedded in the token by AuthService
      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        throw new HttpException(
          403,
          `Access denied. Required permission: ${permissions.join(" or ")}`
        );
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
        throw new HttpException(401, "Authentication required");
      }

      // 1. Super Admin Bypass
      if (req.user.roles && req.user.roles.includes("SUPER_ADMIN")) {
        return next();
      }

      // 2. JWT Permission Check
      const userPermissions = req.user.permissions || [];
      const hasAllPermissions = permissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasAllPermissions) {
        throw new HttpException(
          403,
          `Access denied. Required permissions: ${permissions.join(" and ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
