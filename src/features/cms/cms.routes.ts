import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import CmsController from './cms.controller';
import { CmsDto } from './cms.dto';

class CmsRoute implements Route {

  public path = '/cms';
  public router = Router();
  public CmsController = new CmsController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {

    /**
     *   POST /cms/insertcms
     *   Created CMS content data
     */
    this.router.post(`${this.path}/insertcms`, validationMiddleware(CmsDto, 'body', false, []), (req, res, next) => this.CmsController.addcms(req, res, next));

    /**
     *    PUT /cms/updatecms
     *    Updated CMS content data
     */
    this.router.put(`${this.path}/updatecms`, validationMiddleware(CmsDto, 'body', false, []), (req, res, next) => this.CmsController.updatecmsby(req, res, next));

    /**
     *   POST /cms/deletecms 
     *   Deleted CMS content data
     */
    this.router.post(`${this.path}/deletecms`, validationMiddleware(CmsDto, 'body', true, []), (req, res, next) => this.CmsController.deletecms(req, res, next));

    /**
     *   GET /cms/editcms/:id
     *   Get CMS content by ID for editing
     */
    this.router.get(`${this.path}/editcms/:id`, (req, res, next) => this.CmsController.geteditcms(req, res, next));

    /**
     *    GET /cms/getallcms
     *    Get all active CMS content
     */
    this.router.get(`${this.path}/getallcms`, (req, res, next) => this.CmsController.getallcmsby(req, res, next));
  }
}

export default CmsRoute;