// Refactored User Controller - Common user operations
import { Request, Response, NextFunction } from 'express';
import UserService from './user.service';
import { UserUpdateDto, ChangePasswordDto, PasswordResetRequestDto, PasswordResetDto } from './user.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import HttpException from '../../exceptions/HttpException';

/**
 * User Controller (Refactored)
 * Handles common user operations for all user types
 */
export class UserController {
  private userService = new UserService();

  /**
   * Get current user profile with type-specific data
   * GET /api/v1/users/me
   */
  public getMyProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.userService.getUserWithProfile(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID (admin only)
   * GET /api/v1/users/:id
   */
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getById(userId);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user with profile by ID (admin only)
   * GET /api/v1/users/:id/profile
   */
  public getUserWithProfileById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const profile = await this.userService.getUserWithProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update basic user info
   * PATCH /api/v1/users/me
   */
  public updateBasicInfo = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: UserUpdateDto = req.body;
      const updatedUser = await this.userService.updateBasicInfo(req.user.user_id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'User info updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   * POST /api/v1/users/change-password
   */
  public changePassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { old_password, new_password }: ChangePasswordDto = req.body;
      
      await this.userService.changePassword(
        req.user.user_id,
        old_password,
        new_password
      );
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset
   * POST /api/v1/users/password-reset-request
   */
  public requestPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email }: PasswordResetRequestDto = req.body;

      const user = await this.userService.getUserByEmail(email);

      // Always return success for security reasons (prevent email enumeration)
      // Only generate token if user exists
      if (user) {
        // Generate reset token (expires in 1 hour)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await this.userService.saveResetToken(user.user_id, resetToken, expiresAt);

        // TODO: Send email with reset link
        // await sendPasswordResetEmail(email, resetToken);
      }

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // For development only - remove in production
        resetToken: user && process.env.NODE_ENV === 'development' ?
          'Token generated but not exposed for security' : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password using token
   * POST /api/v1/users/password-reset
   */
  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, new_password }: PasswordResetDto = req.body;
      
      await this.userService.resetPassword(token, new_password);
      
      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   * POST /api/v1/users/verify-email
   */
  public verifyEmail = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.userService.verifyEmail(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify phone
   * POST /api/v1/users/verify-phone
   */
  public verifyPhone = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.userService.verifyPhone(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Phone verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user roles
   * GET /api/v1/users/me/roles
   */
  public getMyRoles = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const roles = await this.userService.getUserRoles(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: { roles }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if user has profile
   * GET /api/v1/users/me/has-profile
   */
  public checkProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const hasProfile = await this.userService.userHasProfile(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: { hasProfile }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Soft delete account
   * DELETE /api/v1/users/me
   */
  public deleteAccount = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.userService.softDelete(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Ban user (admin only)
   * POST /api/v1/users/:id/ban
   */
  public banUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { reason } = req.body;
      
      await this.userService.banUser(userId, reason);
      
      res.status(200).json({
        success: true,
        message: 'User banned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unban user (admin only)
   * POST /api/v1/users/:id/unban
   */
  public unbanUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      await this.userService.unbanUser(userId);
      
      res.status(200).json({
        success: true,
        message: 'User unbanned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Super Admin User Management Methods

  /**
   * Get all users with pagination
   * GET /api/v1/users
   */
  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const role = req.query.role as string;

      const result = await this.userService.getAllUsers({ page, limit, search, role });
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new user (any type)
   * POST /api/v1/users
   */
  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData = req.body;
      const result = await this.userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user by ID
   * PUT /api/v1/users/:id
   */
  public updateUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const result = await this.userService.updateUserById(userId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user permanently
   * DELETE /api/v1/users/:id
   */
  public deleteUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      await this.userService.deleteUserById(userId);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Role Management Methods

  /**
   * Get user's roles
   * GET /api/v1/users/:id/roles
   */
  public getUserRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      const roles = await this.userService.getUserRoles(userId);
      
      res.status(200).json({
        success: true,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign role to user
   * POST /api/v1/users/:id/roles
   */
  public assignRoleToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { roleName } = req.body;
      
      if (!roleName) {
        throw new HttpException(400, 'Role name is required');
      }
      
      await this.userService.assignRoleToUser(userId, roleName);
      
      res.status(200).json({
        success: true,
        message: `Role "${roleName}" assigned to user successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove role from user
   * DELETE /api/v1/users/:id/roles/:roleId
   */
  public removeRoleFromUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const roleId = parseInt(req.params.roleId);
      
      await this.userService.removeRoleFromUser(userId, roleId);
      
      res.status(200).json({
        success: true,
        message: 'Role removed from user successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's permissions
   * GET /api/v1/users/:id/permissions
   */
  public getUserPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      const permissions = await this.userService.getUserPermissions(userId);
      
      res.status(200).json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  };
}
