import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import categoryController from './category.controller';
import { CategoryDto } from './category.dto';

class categoryRoute implements Route {

  public path = '/category';
  public router = Router();
  public categoryController = new categoryController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {

    /**
     *  POST /category/insertcategory
      Inserted category data and success message
     */
    this.router.post(`${this.path}/insertcategory`, validationMiddleware(CategoryDto, 'body', false, []), (req, res, next) => this.categoryController.addcategory(req, res, next));

    /**
     *   GET /category/getallcategorys
     *   Get all active categories
     */
    this.router.get(`${this.path}/getallcategorys`, (req, res, next) => this.categoryController.getallcategorysby(req, res, next));

    /**
     *   GET /category/getcategorytypes
     *   Get categories filtered by type
     */
    this.router.get(`${this.path}/getcategorytypes`, (req, res, next) => this.categoryController.getcategorytypesby(req, res, next));

    /**
     *    GET /category/editcategory/:id
     *    Get a single category by ID for editing
     */
    this.router.get(`${this.path}/editcategory/:id`, (req, res, next) => this.categoryController.geteditcategory(req, res, next));

    /**
     *   PUT /category/updatecategory
     *   Update an existing category
     */
    this.router.put(`${this.path}/updatecategory`, validationMiddleware(CategoryDto, 'body', false, []), (req, res, next) => this.categoryController.updatecategory(req, res, next));

    /**
     *   POST /category/deletecategory
     *   Soft delete a category (marks as deleted but keeps in database)
     */
    this.router.post(`${this.path}/deletecategory`, validationMiddleware(CategoryDto, 'body', true, []), (req, res, next) => this.categoryController.deletecategory(req, res, next));

  }
}

export default categoryRoute;
