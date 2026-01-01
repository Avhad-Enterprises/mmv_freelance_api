import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requirePermission } from "../../middlewares/permission.middleware";
import validationMiddleware from "../../middlewares/validation.middleware";
import categoryController from "./category.controller";
import { CategoryDto } from "./category.dto";

/**
 * Category Routes
 * Uses dynamic RBAC permissions instead of hardcoded roles
 */
class categoryRoute implements Route {
  public path = "/categories";
  public router = Router();
  public categoryController = new categoryController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    /**
     * GET /categories
     * Get all active categories
     * Optional query params: ?type=value to filter by type
     * Public endpoint - no permission required
     */
    this.router.get(`${this.path}`, (req, res, next) =>
      this.categoryController.getallcategorysby(req, res, next)
    );

    /**
     * POST /categories
     * Create a new category
     * Requires: content.create permission
     */
    this.router.post(
      `${this.path}`,
      requirePermission("content.create"),
      validationMiddleware(CategoryDto, "body", false, ["create"]),
      (req, res, next) => this.categoryController.addcategory(req, res, next)
    );

    /**
     * GET /categories/by-type
     * Get categories filtered by type
     * Public endpoint - no permission required
     */
    this.router.get(`${this.path}/by-type`, (req, res, next) =>
      this.categoryController.getcategorytypesby(req, res, next)
    );

    /**
     * GET /categories/:id
     * Get a single category by ID
     * Public endpoint - no permission required
     */
    this.router.get(`${this.path}/:id`, (req, res, next) =>
      this.categoryController.geteditcategory(req, res, next)
    );

    /**
     * PUT /categories/:id
     * Update an existing category
     * Requires: content.update permission
     */
    this.router.put(
      `${this.path}/:id`,
      requirePermission("content.update"),
      validationMiddleware(CategoryDto, "body", true, ["update"]),
      (req, res, next) => this.categoryController.updatecategory(req, res, next)
    );

    /**
     * DELETE /categories/:id
     * Soft delete a category (marks as deleted but keeps in database)
     * Requires: content.delete permission
     */
    this.router.delete(
      `${this.path}/:id`,
      requirePermission("content.delete"),
      (req, res, next) => this.categoryController.deletecategory(req, res, next)
    );
  }
}

export default categoryRoute;
