// Videographer Controller - Handles videographer-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import VideographerService from './videographer.service';
import { VideographerUpdateDto } from './videographer.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';

/**
 * Videographer Controller
 * Handles all videographer-specific endpoints
 */
export class VideographerController {
  private videographerService = new VideographerService();

  /**
   * Get current videographer's profile
   * GET /api/v1/videographers/profile
   */
  public getMyProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.videographerService.getVideographerProfile(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get videographer by ID (public/admin)
   * GET /api/v1/videographers/:id
   */
  public getVideographerById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const videographerId = parseInt(req.params.id);
      const profile = await this.videographerService.getVideographerProfile(videographerId);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get videographer by username
   * GET /api/v1/videographers/username/:username
   */
  public getByUsername = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { username } = req.params;
      const profile = await this.videographerService.getVideographerByUsername(username);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all videographers
   * GET /api/v1/videographers
   */
  public getAllVideographers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const videographers = await this.videographerService.getAllVideographers();
      
      res.status(200).json({
        success: true,
        count: videographers.length,
        data: videographers
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get top-rated videographers
   * GET /api/v1/videographers/top-rated
   */
  public getTopRated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const videographers = await this.videographerService.getTopRated(limit);
      
      res.status(200).json({
        success: true,
        count: videographers.length,
        data: videographers
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update videographer profile
   * PATCH /api/v1/videographers/profile
   */
  public updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: VideographerUpdateDto = req.body;
      
      // Update freelancer profile fields only (freelancer_profiles table)
      await this.videographerService.updateFreelancerProfile(req.user.user_id, updateData);
      
      // Get updated profile
      const updatedProfile = await this.videographerService.getVideographerProfile(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get videographer statistics
   * GET /api/v1/videographers/profile/stats
   */
  public getStats = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.videographerService.getFreelancerStats(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete videographer account (soft delete)
   * DELETE /api/v1/videographers/profile
   */
  public deleteAccount = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.videographerService.softDelete(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
