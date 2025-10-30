// Video Editor Controller - Handles video editor-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import VideoEditorService from './videoeditor.service';
import UserService from '../user/user.service';
import { VideoEditorUpdateDto } from './videoeditor.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';

/**
 * Video Editor Controller
 * Handles all video editor-specific endpoints
 */
export class VideoEditorController {
  private videoEditorService = new VideoEditorService();
  private userService = new UserService();

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
   * Update video editor profile (unified - handles both user and profile fields)
   * PATCH /api/v1/videoeditors/profile
   */
  public updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: VideoEditorUpdateDto = req.body;

      // Separate user fields from profile fields
      const userFields = {
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        username: updateData.username,
        email: updateData.email,
        phone_number: updateData.phone_number,
        phone_verified: updateData.phone_verified,
        email_verified: updateData.email_verified,
        profile_picture: updateData.profile_picture,
        bio: updateData.bio,
        timezone: updateData.timezone,
        address_line_first: updateData.address_line_first,
        address_line_second: updateData.address_line_second,
        city: updateData.city,
        state: updateData.state,
        country: updateData.country,
        pincode: updateData.pincode,
        email_notifications: updateData.email_notifications
      };

      const profileFields = {
        profile_title: updateData.profile_title,
        role: updateData.role,
        short_description: updateData.short_description,
        experience_level: updateData.experience_level,
        skills: updateData.skills,
        software_skills: updateData.software_skills,
        superpowers: updateData.superpowers,
        skill_tags: updateData.skill_tags,
        base_skills: updateData.base_skills,
        languages: updateData.languages,
        portfolio_links: updateData.portfolio_links,
        certification: updateData.certification,
        education: updateData.education,
        previous_works: updateData.previous_works,
        services: updateData.services,
        rate_amount: updateData.rate_amount,
        currency: updateData.currency,
        availability: updateData.availability,
        work_type: updateData.work_type,
        hours_per_week: updateData.hours_per_week,
        id_type: updateData.id_type,
        id_document_url: updateData.id_document_url,
        kyc_verified: updateData.kyc_verified,
        aadhaar_verification: updateData.aadhaar_verification,
        payment_method: updateData.payment_method,
        bank_account_info: updateData.bank_account_info
      };

      // Update user table fields if any are provided
      const hasUserFields = Object.values(userFields).some(value => value !== undefined);
      if (hasUserFields) {
        await this.userService.updateBasicInfo(req.user.user_id, userFields);
      }

      // Update freelancer profile fields if any are provided
      const hasProfileFields = Object.values(profileFields).some(value => value !== undefined);
      if (hasProfileFields) {
        await this.videoEditorService.updateFreelancerProfile(req.user.user_id, profileFields);
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
