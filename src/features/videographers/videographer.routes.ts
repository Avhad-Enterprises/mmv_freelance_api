// Videographer Routes - Videographer-specific endpoints with RBAC
import { Router } from 'express';
import { VideographerController } from './videographer.controller';
import { requireRole } from '../../middlewares/role.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { FreelancerUpdateDto } from '../freelancers/freelancer.update.dto';
import Route from '../../interfaces/route.interface';

/**
 * Videographer Routes
 * Public routes for discovery, protected routes for profile management
 */
export class VideographerRoutes implements Route {
  public path = '/videographers';
  public router = Router();
  private videographerController = new VideographerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public/Discovery routes (require authentication only)

    /**
     * Get all videographers
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}`,
      this.videographerController.getAllVideographers
    );

    /**
     * Get top-rated videographers
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/top-rated`,
      this.videographerController.getTopRated
    );

    /**
     * Search videographers by availability
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/availability/:availability`,
      this.videographerController.searchByAvailability
    );

    /**
     * Search videographers by skill
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/skill/:skill`,
      this.videographerController.searchBySkill
    );

    /**
     * Search videographers by hourly rate
     * Requires: Authentication
     * Query params: min, max
     */
    this.router.get(
      `${this.path}/search/rate`,
      this.videographerController.searchByRate
    );

    /**
     * Search videographers by experience level
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/search/experience/:level`,
      this.videographerController.searchByExperience
    );

    /**
     * Get videographer by username
     * Requires: Authentication
     */
    this.router.get(
      `${this.path}/username/:username`,
      this.videographerController.getByUsername
    );

    // Profile routes (VIDEOGRAPHER role required)

    /**
     * Get current videographer's profile
     * Requires: VIDEOGRAPHER role
     */
    this.router.get(
      `${this.path}/profile`,
      requireRole('VIDEOGRAPHER'),
      this.videographerController.getMyProfile
    );

    /**
     * Update current videographer's profile
     * Requires: VIDEOGRAPHER role + profile.update permission
     */
    this.router.patch(
      `${this.path}/profile`,
      requireRole('VIDEOGRAPHER'),
      requirePermission('profile.update'),
      validationMiddleware(FreelancerUpdateDto, 'body', true, []),
      this.videographerController.updateProfile
    );

    /**
     * Get current videographer's statistics
     * Requires: VIDEOGRAPHER role
     */
    this.router.get(
      `${this.path}/profile/stats`,
      requireRole('VIDEOGRAPHER'),
      this.videographerController.getStats
    );

    /**
     * Delete videographer account (soft delete)
     * Requires: VIDEOGRAPHER role + users.delete permission
     */
    this.router.delete(
      `${this.path}/profile`,
      requireRole('VIDEOGRAPHER'),
      requirePermission('users.delete'),
      this.videographerController.deleteAccount
    );

    // Admin routes

    /**
     * Get videographer by ID
     * Requires: Authentication (any role can view public profiles)
     */
    this.router.get(
      `${this.path}/:id`,
      this.videographerController.getVideographerById
    );
  }
}
