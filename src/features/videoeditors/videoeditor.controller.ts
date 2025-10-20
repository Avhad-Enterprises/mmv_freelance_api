// Video Editor Controller - Handles video editor-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import VideoEditorService from './videoeditor.service';
import { VideoEditorUpdateDto } from './videoeditor.update.dto';
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
      const updateData: VideoEditorUpdateDto = req.body;
      
      // Update freelancer profile fields
      await this.videoEditorService.updateFreelancerProfile(req.user.user_id, updateData);
      
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
