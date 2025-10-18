// Video Editor Routes - Video editor-specific endpoints with RBAC
import { Router } from 'express';
import { VideoEditorController } from './videoeditor.controller';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { FreelancerUpdateDto } from '../freelancers/freelancer.update.dto';
import Route from '../../interfaces/route.interface';

/**
 * Video Editor Routes
 * Public routes for discovery, protected routes for profile management
 */
export class VideoEditorRoutes implements Route {
  public path = '/videoeditors';
  public router = Router();
  private videoEditorController = new VideoEditorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public/Discovery routes (require authentication only)

    /**
     * Get all video editors
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/getvideoeditors`,
      this.videoEditorController.getAllVideoEditors
    );

    /**
     * Get top-rated video editors
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/top-rated`,
      this.videoEditorController.getTopRated
    );

    /**
     * Get available editors with task counts
     * Requires: Authentication (useful for task assignment)
     */
    this.router.get(
      `${this.path}/available`,
      this.videoEditorController.getAvailableEditors
    );

    /**
     * Get video editor by username
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/username/:username`,
      this.videoEditorController.getByUsername
    );

    // Profile routes (VIDEO_EDITOR role required)

    /**
     * Get current video editor's profile
     * Requires: VIDEO_EDITOR role
     */
    this.router.get(
      `${this.path}/profile`,
      requireRole('VIDEO_EDITOR'),
      this.videoEditorController.getMyProfile
    );

    /**
     * Update current video editor's profile
     * Requires: VIDEO_EDITOR role
     */
    this.router.patch(
      `${this.path}/profile`,
      requireRole('VIDEO_EDITOR'),
      validationMiddleware(FreelancerUpdateDto, 'body', true, []),
      this.videoEditorController.updateProfile
    );

    /**
     * Get current video editor's statistics
     * Requires: VIDEO_EDITOR role
     */
    this.router.get(
      `${this.path}/profile/stats`,
      requireRole('VIDEO_EDITOR'),
      this.videoEditorController.getStats
    );

    // Admin routes

    /**
     * Get video editor by ID
     * Requires: Authentication (any role can view public profiles)
     */
    this.router.get(
      `${this.path}/:id`,
      this.videoEditorController.getVideoEditorById
    );
  }
}
