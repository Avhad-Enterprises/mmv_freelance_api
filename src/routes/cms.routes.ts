import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import CmsController from '../controllers/cms.controllers';
import { CmsDto } from '../dtos/cms.dto';

class CmsRoute implements Route {

  public path = '/cms';
  public router = Router();
  public CmsController = new CmsController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {

    this.router.post(`${this.path}/insertcms`, validationMiddleware(CmsDto, 'body', false, []), (req, res, next) => this.CmsController.addcms(req, res, next));
    this.router.put(`${this.path}/updatecms`, validationMiddleware(CmsDto, 'body', false, []), (req, res, next) => this.CmsController.updatecmsby(req, res, next));
    this.router.post(`${this.path}/deletecms`, validationMiddleware(CmsDto, 'body', true, []), (req, res, next) => this.CmsController.deletecms(req, res, next));
    this.router.get(`${this.path}/editcms/:id`, (req, res, next) => this.CmsController.geteditcms(req, res, next));
    this.router.get(`${this.path}/getallcms`, (req, res, next) => this.CmsController.getallcmsby(req, res, next));
  }
}

export default CmsRoute;