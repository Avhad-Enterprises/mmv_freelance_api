import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requirePermission } from "../../middlewares/permission.middleware";
import validationMiddleware from "../../middlewares/validation.middleware";
import TagsController from "./tag.controller";
import { TagsDto } from "./tag.dto";

/**
 * Tags Routes
 * Handles all tag-related API endpoints with permission-based access control
 * Uses dynamic RBAC permissions instead of hardcoded roles
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
     * Requires: content.create permission
     */
    this.router.post(
      `${this.path}`,
      requirePermission("content.create"),
      validationMiddleware(TagsDto, "body", false, []),
      this.tagsController.createTag
    );

    /**
     * Get all tags
     * GET /api/v1/tags
     * Requires: content.view permission
     */
    this.router.get(
      `${this.path}`,
      requirePermission("content.view"),
      this.tagsController.getAllTags
    );

    /**
     * Get tag by ID
     * GET /api/v1/tags/:id
     * Requires: content.view permission
     */
    this.router.get(
      `${this.path}/:id`,
      requirePermission("content.view"),
      this.tagsController.getTagById
    );

    /**
     * Get tags by type
     * GET /api/v1/tags/type/:type
     * Requires: content.view permission
     */
    this.router.get(
      `${this.path}/type/:type`,
      requirePermission("content.view"),
      this.tagsController.getTagsByType
    );

    /**
     * Update tag
     * PUT /api/v1/tags/:id
     * Requires: content.update permission
     */
    this.router.put(
      `${this.path}/:id`,
      requirePermission("content.update"),
      validationMiddleware(TagsDto, "body", true, []),
      this.tagsController.updateTag
    );

    /**
     * Delete tag (soft delete)
     * DELETE /api/v1/tags/:id
     * Requires: content.delete permission
     */
    this.router.delete(
      `${this.path}/:id`,
      requirePermission("content.delete"),
      this.tagsController.deleteTag
    );
  }
}

export default TagsRoute;
