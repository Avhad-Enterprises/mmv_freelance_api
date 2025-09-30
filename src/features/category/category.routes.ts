import { Router } from 'express';
import Route from '../../interfaces/route.interface';
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

    this.router.post(`${this.path}/insertcategory`, validationMiddleware(CategoryDto, 'body', false, []), (req, res, next) => this.categoryController.addcategory(req, res, next));

    this.router.get(`${this.path}/getallcategorys`, (req, res, next) => this.categoryController.getallcategorysby(req, res, next));

    this.router.get(`${this.path}/getcategorytypes`, (req, res, next) => this.categoryController.getcategorytypesby(req, res, next));

    this.router.get(`${this.path}/editcategory/:id`, (req, res, next) => this.categoryController.geteditcategory(req, res, next));

    this.router.put(`${this.path}/updatecategory`, validationMiddleware(CategoryDto, 'body', false, []), (req, res, next) => this.categoryController.updatecategory(req, res, next));

    this.router.post(`${this.path}/deletecategory`, validationMiddleware(CategoryDto, 'body', true, []), (req, res, next) => this.categoryController.deletecategory(req, res, next));

  }
}

export default categoryRoute;
