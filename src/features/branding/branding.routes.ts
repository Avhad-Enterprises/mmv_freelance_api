import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import brandingcontrollers from './branding.controller';
import { BrandingAssetsDto } from './branding.dto';

class branding_assetsRoute implements Route {

  public path = '/branding_assets';
  public router = Router();
  public brandingcontrollers = new brandingcontrollers();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //branding_assets section  , validationMiddleware(branding_AssetsDto, 'body', false, [])
    this.router.post(`${this.path}/update`, validationMiddleware(BrandingAssetsDto, 'body', false, []), this.brandingcontrollers.update);
    this.router.get(`${this.path}/getall`, this.brandingcontrollers.getallbranding);
    this.router.get(`${this.path}/getnavbar-logo`, this.brandingcontrollers.getNavbarLogo);
    this.router.get(`${this.path}/getnavbar_logo_mobile`, this.brandingcontrollers.getnavbar_logo_mobile);
    this.router.get(`${this.path}/getfooter_logo`, this.brandingcontrollers.getfooter_logo);
    this.router.get(`${this.path}/getfavicon`, this.brandingcontrollers.getfavicon);

}
}

export default branding_assetsRoute;