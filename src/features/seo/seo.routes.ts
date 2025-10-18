import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from "../../middlewares/validation.middleware";
import SeoController from "./seo.controller";
import { SeoDto, UpdateSeoDto } from "./seo.dto";

/**
 * SEO Routes
 * Handles all SEO-related API endpoints with role-based access control
 * Restricted to ADMIN and SUPER_ADMIN roles only
 */
class SeoRoute implements Route {
    public path = "/seos";
    public router = Router();
    public seoController = new SeoController();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Initialize all SEO routes with proper middleware
     */
    private initializeRoutes() {
        /**
         * Create a new SEO entry
         * POST /api/v1/seos
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.post(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(SeoDto, 'body', false, []),
            this.seoController.createSeo
        );

        /**
         * Get all SEO entries
         * GET /api/v1/seos
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.seoController.getAllSeos
        );

        /**
         * Get SEO entry by ID
         * GET /api/v1/seos/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.seoController.getSeoById
        );

        /**
         * Update SEO entry
         * PUT /api/v1/seos/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.put(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(UpdateSeoDto, 'body', true, []),
            this.seoController.updateSeo
        );

        /**
         * Delete SEO entry (soft delete)
         * DELETE /api/v1/seos/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.delete(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.seoController.deleteSeo
        );
    }
}

export default SeoRoute;