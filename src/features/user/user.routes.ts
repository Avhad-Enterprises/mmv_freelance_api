// User Routes (Refactored) - Common user endpoints with RBAC
import { Router } from 'express';
import { UserController } from './user.controller';
import { requireRole } from '../../middlewares/role.middleware';
// import { requirePermission } from '../../middlewares/permission.middleware'; // DISABLED: Using only role-based access
import validationMiddleware from '../../middlewares/validation.middleware';
import {
  UserUpdateDto,
  ChangePasswordDto,
  PasswordResetRequestDto,
  PasswordResetDto,
  SetPasswordDto
} from './user.update.dto';
import { CreateUserDto, AssignRoleDto, UpdateUserDto } from './user.admin.dto';
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
     * Requires: Authentication (any user can update their own profile)
     */
    this.router.patch(
      `${this.path}/me`,
      // requirePermission('profile.update'), // DISABLED: Using only role-based access
      validationMiddleware(UserUpdateDto, 'body', true, []),
      this.userController.updateBasicInfo
    );

    /**
     * Delete own account (soft delete)
     * Requires: Authentication (any user can delete their own account)
     */
    this.router.delete(
      `${this.path}/me`,
      // requirePermission('users.delete'), // DISABLED: Using only role-based access
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

    /**
     * Get profile completion status
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/me/profile-completion`,
      this.userController.getProfileCompletion
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

    /**
     * Set password (for OAuth users)
     * Requires: Authentication
     */
    this.router.post(
      `${this.path}/set-password`,
      validationMiddleware(SetPasswordDto, 'body', false, []),
      this.userController.setPassword
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
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}/:id`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      // requirePermission('users.view'), // DISABLED: Using only role-based access
      this.userController.getUserById
    );

    /**
     * Get user with profile by ID
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}/:id/profile`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      // requirePermission('users.view'), // DISABLED: Using only role-based access
      this.userController.getUserWithProfileById
    );

    /**
     * Ban user
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.post(
      `${this.path}/:id/ban`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      // requirePermission('users.ban'), // DISABLED: Using only role-based access
      this.userController.banUser
    );

    /**
     * Unban user
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.post(
      `${this.path}/:id/unban`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      // requirePermission('users.ban'), // DISABLED: Using only role-based access
      this.userController.unbanUser
    );

    // User Management (Super Admin)

    /**
     * Get all users with pagination
     * Requires: SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}`,
      requireRole('SUPER_ADMIN'),
      // requirePermission('users.view'), // DISABLED: Using only role-based access
      this.userController.getAllUsers
    );

    /**
     * Create new user (any type)
     * Requires: SUPER_ADMIN role
     */
    this.router.post(
      `${this.path}`,
      requireRole('SUPER_ADMIN'),
      // requirePermission('users.create'), // DISABLED: Using only role-based access
      validationMiddleware(CreateUserDto, 'body', false, []),
      this.userController.createUser
    );

    /**
     * Update user by ID
     * Requires: SUPER_ADMIN role
     */
    this.router.put(
      `${this.path}/:id`,
      requireRole('SUPER_ADMIN'),
      // requirePermission('users.update'), // DISABLED: Using only role-based access
      validationMiddleware(UpdateUserDto, 'body', true, []),
      this.userController.updateUserById
    );

    /**
     * Delete user permanently
     * Requires: SUPER_ADMIN role
     */
    this.router.delete(
      `${this.path}/:id`,
      requireRole('SUPER_ADMIN'),
      // requirePermission('users.delete'), // DISABLED: Using only role-based access
      this.userController.deleteUserById
    );

    // Role Management

    /**
     * Get user's roles
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}/:id/roles`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      // requirePermission('admin.roles'), // DISABLED: Using only role-based access
      this.userController.getUserRoles
    );

    /**
     * Assign role to user
     * Requires: SUPER_ADMIN role
     */
    this.router.post(
      `${this.path}/:id/roles`,
      requireRole('SUPER_ADMIN'),
      // requirePermission('admin.roles'), // DISABLED: Using only role-based access
      validationMiddleware(AssignRoleDto, 'body', false, []),
      this.userController.assignRoleToUser
    );

    /**
     * Remove role from user
     * Requires: SUPER_ADMIN role
     */
    this.router.delete(
      `${this.path}/:id/roles/:roleId`,
      requireRole('SUPER_ADMIN'),
      // requirePermission('admin.roles'), // DISABLED: Using only role-based access
      this.userController.removeRoleFromUser
    );

    /**
     * Get user's permissions
     * Requires: ADMIN or SUPER_ADMIN role
     */
    this.router.get(
      `${this.path}/:id/permissions`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      // requirePermission('admin.roles'), // DISABLED: Using only role-based access
      this.userController.getUserPermissions
    );

  }
}
