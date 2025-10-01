// User Routes (Refactored) - Common user endpoints with RBAC
import { Router } from 'express';
import { UserController } from './user.controller';
import { requireRole } from '../../middlewares/role.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { 
  UserUpdateDto, 
  ChangePasswordDto, 
  PasswordResetRequestDto, 
  PasswordResetDto 
} from './user.update.dto';
import Route from '../../interfaces/route.interface';

/**
 * User Routes (Refactored)
 * Common user operations for all user types
 * Uses RBAC for authorization
 */
export class UserRoutes implements Route {
  public path = '/users';
  public router = Router();
  private userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public routes (no authentication required)

    /**
     * Request password reset
     * No authentication required
     */
    this.router.post(
      `${this.path}/password-reset-request`,
      validationMiddleware(PasswordResetRequestDto, 'body', false, []),
      this.userController.requestPasswordReset
    );

    /**
     * Reset password using token
     * No authentication required
     */
    this.router.post(
      `${this.path}/password-reset`,
      validationMiddleware(PasswordResetDto, 'body', false, []),
      this.userController.resetPassword
    );

    // Authenticated routes (all user types)

    /**
     * Get current user's profile (with type-specific data)
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/me`,
      this.userController.getMyProfile
    );

    /**
     * Update basic user info
     * Requires: Authentication + profile.update permission
     */
    this.router.patch(
      `${this.path}/me`,
      requirePermission('profile.update'),
      validationMiddleware(UserUpdateDto, 'body', true, []),
      this.userController.updateBasicInfo
    );

    /**
     * Delete own account (soft delete)
     * Requires: Authentication + users.delete permission
     */
    this.router.delete(
      `${this.path}/me`,
      requirePermission('users.delete'),
      this.userController.deleteAccount
    );

    /**
     * Get current user's roles
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/me/roles`,
      this.userController.getMyRoles
    );

    /**
     * Check if user has profile
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/me/has-profile`,
      this.userController.checkProfile
    );

    // Password management

    /**
     * Change password
     * Requires: Authentication
     */
    this.router.post(
      `${this.path}/change-password`,
      validationMiddleware(ChangePasswordDto, 'body', false, []),
      this.userController.changePassword
    );

    // Verification

    /**
     * Verify email
     * Requires: Authentication
     */
    this.router.post(
      `${this.path}/verify-email`,
      this.userController.verifyEmail
    );

    /**
     * Verify phone
     * Requires: Authentication
     */
    this.router.post(
      `${this.path}/verify-phone`,
      this.userController.verifyPhone
    );

    // Admin routes

    /**
     * Get user by ID
     * Requires: ADMIN or SUPER_ADMIN + users.view permission
     */
    this.router.get(
      `${this.path}/:id`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      requirePermission('users.view'),
      this.userController.getUserById
    );

    /**
     * Get user with profile by ID
     * Requires: ADMIN or SUPER_ADMIN + users.view permission
     */
    this.router.get(
      `${this.path}/:id/profile`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      requirePermission('users.view'),
      this.userController.getUserWithProfileById
    );

    /**
     * Ban user
     * Requires: ADMIN or SUPER_ADMIN + users.ban permission
     */
    this.router.post(
      `${this.path}/:id/ban`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      requirePermission('users.ban'),
      this.userController.banUser
    );

    /**
     * Unban user
     * Requires: ADMIN or SUPER_ADMIN + users.ban permission
     */
    this.router.post(
      `${this.path}/:id/unban`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      requirePermission('users.ban'),
      this.userController.unbanUser
    );
  }
}
