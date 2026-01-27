// Videographer Controller - Handles videographer-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import VideographerService from './videographer.service';
import UserService from '../user/user.service';
import { VideographerUpdateDto } from './videographer.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';

/**
 * Videographer Controller
 * Handles all videographer-specific endpoints
 */
export class VideographerController {
  private videographerService = new VideographerService();
  private userService = new UserService();

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
      const videographerId = parseInt(req.params.id as string);
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
      const username = req.params.username as string;
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
   * Update videographer profile (unified - handles both user and profile fields)
   * PATCH /api/v1/videographers/profile
   */
  public updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: VideographerUpdateDto = req.body;

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
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        country: updateData.country,
        pincode: updateData.pincode,
        email_notifications: updateData.email_notifications
      };

      const profileFields = {
        profile_title: updateData.profile_title,
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
        await this.videographerService.updateFreelancerProfile(req.user.user_id, profileFields);
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
