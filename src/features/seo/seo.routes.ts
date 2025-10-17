import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import SEOcontroller from './seo.controller';
import { SeoDto } from './seo.dto';

class subscribed_emailsRoute implements Route {

  public path = '/SEO';
  public router = Router();
  public SEOcontroller = new SEOcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //SEO detail routes
    this.router.post(`${this.path}/insert`, validationMiddleware(SeoDto, 'body', false, []), this.SEOcontroller.insert);
    //Get SEO detail by seodetail
    this.router.get(`${this.path}/getall`, this.SEOcontroller.getAllbyseodetail);
    //Update SEO detail by seodetail
    this.router.put(`${this.path}/update`, this.SEOcontroller.updatebyseodetail);

}
}

export default subscribed_emailsRoute;