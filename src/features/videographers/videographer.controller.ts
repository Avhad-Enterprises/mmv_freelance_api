// Videographer Controller - Handles videographer-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import VideographerService from './videographer.service';
import { FreelancerUpdateDto } from '../freelancers/freelancer.update.dto';
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
      const updateData: FreelancerUpdateDto = req.body;
      
      // Update base user fields if provided
      const userFields = [
        'first_name', 'last_name', 'email', 'phone_number', 
        'profile_picture', 'bio', 'timezone', 'address_line_first',
        'address_line_second', 'city', 'state', 'country', 'pincode'
      ];
      
      const hasUserFields = Object.keys(updateData).some(key => userFields.includes(key));
      
      if (hasUserFields) {
        const userUpdateData: any = {};
        userFields.forEach(field => {
          if (updateData[field as keyof FreelancerUpdateDto] !== undefined) {
            userUpdateData[field] = updateData[field as keyof FreelancerUpdateDto];
          }
        });
        await this.videographerService.updateBasicInfo(req.user.user_id, userUpdateData);
      }
      
      // Update freelancer profile fields
      const profileFields = Object.keys(updateData).filter(key => !userFields.includes(key));
      if (profileFields.length > 0) {
        const profileData: any = {};
        profileFields.forEach(field => {
          profileData[field] = updateData[field as keyof FreelancerUpdateDto];
        });
        await this.videographerService.updateFreelancerProfile(req.user.user_id, profileData);
      }
      
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
