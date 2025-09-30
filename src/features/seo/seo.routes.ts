import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { RequestHandler } from 'express';
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

    //subscribed_emails section  , validationMiddleware(SubscribedEmailDTO, 'body', false, [])
    this.router.post(`${this.path}/insert`, validationMiddleware(SeoDto, 'body', false, []), this.SEOcontroller.insert);
    this.router.get(`${this.path}/getall`, this.SEOcontroller.getAllbyseodetail);
    this.router.put(`${this.path}/update`, this.SEOcontroller.updatebyseodetail);

}
}

export default subscribed_emailsRoute;