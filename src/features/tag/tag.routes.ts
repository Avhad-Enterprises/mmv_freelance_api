import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from "../../middlewares/validation.middleware";
import TagsController from "./tag.controller";
import { TagsDto } from "./tag.dto";

/**
 * Tags Routes
 * Handles all tag-related API endpoints with role-based access control
 * Restricted to ADMIN and SUPER_ADMIN roles only
 */
class TagsRoute implements Route {
    public path = "/tags";
    public router = Router();
    public tagsController = new TagsController();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Initialize all tag routes with proper middleware
     */
    private initializeRoutes() {
        /**
         * Create a new tag
         * POST /api/v1/tags
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.post(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(TagsDto, 'body', false, []),
            this.tagsController.createTag
        );

        /**
         * Get all tags
         * GET /api/v1/tags
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.tagsController.getAllTags
        );

        /**
         * Get tag by ID
         * GET /api/v1/tags/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.tagsController.getTagById
        );

        /**
         * Get tags by type
         * GET /api/v1/tags/type/:type
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}/type/:type`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.tagsController.getTagsByType
        );

        /**
         * Update tag
         * PUT /api/v1/tags/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.put(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(TagsDto, 'body', true, []),
            this.tagsController.updateTag
        );

        /**
         * Delete tag (soft delete)
         * DELETE /api/v1/tags/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.delete(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.tagsController.deleteTag
        );
    }
}

export default TagsRoute;
