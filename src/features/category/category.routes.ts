import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import categoryController from './category.controller';
import { CategoryDto } from './category.dto';

class categoryRoute implements Route {

  public path = '/categories';
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
     */
    this.router.get(`${this.path}`, (req, res, next) => this.categoryController.getallcategorysby(req, res, next));

    /**
     * POST /categories
     * Create a new category
     * Requires authentication
     */
    this.router.post(`${this.path}`, requireRole('ADMIN', 'SUPER_ADMIN'), validationMiddleware(CategoryDto, 'body', false, ['create']), (req, res, next) => this.categoryController.addcategory(req, res, next));

    /**
     * GET /categories/by-type
     * Get categories filtered by type
     * Requires type in request body or query param
     */
    this.router.get(`${this.path}/by-type`, (req, res, next) => this.categoryController.getcategorytypesby(req, res, next));

    /**
     * GET /categories/:id
     * Get a single category by ID
     */
    this.router.get(`${this.path}/:id`, (req, res, next) => this.categoryController.geteditcategory(req, res, next));

    /**
     * PUT /categories/:id
     * Update an existing category
     * Requires authentication
     */
    this.router.put(`${this.path}/:id`, requireRole('ADMIN', 'SUPER_ADMIN'), validationMiddleware(CategoryDto, 'body', true, ['update']), (req, res, next) => this.categoryController.updatecategory(req, res, next));

    /**
     * DELETE /categories/:id
     * Soft delete a category (marks as deleted but keeps in database)
     * Requires authentication
     */
    this.router.delete(`${this.path}/:id`, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => this.categoryController.deletecategory(req, res, next));

  }
}

export default categoryRoute;
