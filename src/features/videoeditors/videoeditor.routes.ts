// Video Editor Routes - Video editor-specific endpoints with RBAC
import { Router } from 'express';
import { VideoEditorController } from './videoeditor.controller';
import { requireRole } from '../../middlewares/role.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
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
      `${this.path}`,
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
     * Search video editors by software
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/software/:software`,
      this.videoEditorController.searchBySoftware
    );

    /**
     * Search video editors by skill
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/skill/:skill`,
      this.videoEditorController.searchBySkill
    );

    /**
     * Search video editors by hourly rate
     * Requires: Authentication
     * Query params: min, max
     */
    this.router.get(
      `${this.path}/search/rate`,
      this.videoEditorController.searchByRate
    );

    /**
     * Search video editors by experience level
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/experience/:level`,
      this.videoEditorController.searchByExperience
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
     * Requires: VIDEO_EDITOR role + profile.update permission
     */
    this.router.patch(
      `${this.path}/profile`,
      requireRole('VIDEO_EDITOR'),
      requirePermission('profile.update'),
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

    /**
     * Delete video editor account (soft delete)
     * Requires: VIDEO_EDITOR role + users.delete permission
     */
    this.router.delete(
      `${this.path}/profile`,
      requireRole('VIDEO_EDITOR'),
      requirePermission('users.delete'),
      this.videoEditorController.deleteAccount
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
