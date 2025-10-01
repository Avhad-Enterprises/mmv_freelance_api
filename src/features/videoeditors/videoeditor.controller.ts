// Video Editor Controller - Handles video editor-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import VideoEditorService from './videoeditor.service';
import { FreelancerUpdateDto } from '../freelancers/freelancer.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';

/**
 * Video Editor Controller
 * Handles all video editor-specific endpoints
 */
export class VideoEditorController {
  private videoEditorService = new VideoEditorService();

  /**
   * Get current video editor's profile
   * GET /api/v1/videoeditors/profile
   */
  public getMyProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.videoEditorService.getVideoEditorProfile(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get video editor by ID (public/admin)
   * GET /api/v1/videoeditors/:id
   */
  public getVideoEditorById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const editorId = parseInt(req.params.id);
      const profile = await this.videoEditorService.getVideoEditorProfile(editorId);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get video editor by username
   * GET /api/v1/videoeditors/username/:username
   */
  public getByUsername = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { username } = req.params;
      const profile = await this.videoEditorService.getVideoEditorByUsername(username);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all video editors
   * GET /api/v1/videoeditors
   */
  public getAllVideoEditors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const videoEditors = await this.videoEditorService.getAllVideoEditors();
      
      res.status(200).json({
        success: true,
        count: videoEditors.length,
        data: videoEditors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get top-rated video editors
   * GET /api/v1/videoeditors/top-rated
   */
  public getTopRated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const videoEditors = await this.videoEditorService.getTopRated(limit);
      
      res.status(200).json({
        success: true,
        count: videoEditors.length,
        data: videoEditors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get available editors with task counts (for load balancing)
   * GET /api/v1/videoeditors/available
   */
  public getAvailableEditors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const editors = await this.videoEditorService.getAvailableEditorsCount();
      
      res.status(200).json({
        success: true,
        count: editors.length,
        data: editors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update video editor profile
   * PATCH /api/v1/videoeditors/profile
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
        await this.videoEditorService.updateBasicInfo(req.user.user_id, userUpdateData);
      }
      
      // Update freelancer profile fields
      const profileFields = Object.keys(updateData).filter(key => !userFields.includes(key));
      if (profileFields.length > 0) {
        const profileData: any = {};
        profileFields.forEach(field => {
          profileData[field] = updateData[field as keyof FreelancerUpdateDto];
        });
        await this.videoEditorService.updateFreelancerProfile(req.user.user_id, profileData);
      }
      
      // Get updated profile
      const updatedProfile = await this.videoEditorService.getVideoEditorProfile(req.user.user_id);
      
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
   * Search video editors by software
   * GET /api/v1/videoeditors/search/software/:software
   */
  public searchBySoftware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { software } = req.params;
      const videoEditors = await this.videoEditorService.searchBySoftware(software);
      
      res.status(200).json({
        success: true,
        count: videoEditors.length,
        data: videoEditors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search video editors by skill
   * GET /api/v1/videoeditors/search/skill/:skill
   */
  public searchBySkill = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { skill } = req.params;
      const videoEditors = await this.videoEditorService.searchBySkill(skill);
      
      res.status(200).json({
        success: true,
        count: videoEditors.length,
        data: videoEditors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search video editors by hourly rate range
   * GET /api/v1/videoeditors/search/rate?min=50&max=200
   */
  public searchByRate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const minRate = parseInt(req.query.min as string) || 0;
      const maxRate = parseInt(req.query.max as string) || 10000;
      const videoEditors = await this.videoEditorService.searchByHourlyRate(minRate, maxRate);
      
      res.status(200).json({
        success: true,
        count: videoEditors.length,
        data: videoEditors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search video editors by experience level
   * GET /api/v1/videoeditors/search/experience/:level
   */
  public searchByExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { level } = req.params;
      const videoEditors = await this.videoEditorService.searchByExperienceLevel(level);
      
      res.status(200).json({
        success: true,
        count: videoEditors.length,
        data: videoEditors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get video editor statistics
   * GET /api/v1/videoeditors/profile/stats
   */
  public getStats = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.videoEditorService.getFreelancerStats(req.user.user_id);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete video editor account (soft delete)
   * DELETE /api/v1/videoeditors/profile
   */
  public deleteAccount = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.videoEditorService.softDelete(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
