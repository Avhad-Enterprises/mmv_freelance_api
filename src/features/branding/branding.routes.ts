import { Router } from 'express';
import Route from '../../interfaces/route.interface';
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

    /**
     * POST /branding_assets/update
     * Updated branding assets data
     */
    this.router.post(`${this.path}/update`, validationMiddleware(BrandingAssetsDto, 'body', false, []), this.brandingcontrollers.update);

    /**
     * GET /branding_assets/getall
     *  All active branding assets including logos and favicon
     */
    this.router.get(`${this.path}/getall`, this.brandingcontrollers.getallbranding);

    /**
     * GET /branding_assets/getnavbar-logo
     * Navbar logo URL and related settings
     */
    this.router.get(`${this.path}/getnavbar-logo`, this.brandingcontrollers.getNavbarLogo);

    /**
     * GET /branding_assets/getnavbar_logo_mobile
   Mobile navbar logo URL and related settings
     */
    this.router.get(`${this.path}/getnavbar_logo_mobile`, this.brandingcontrollers.getnavbar_logo_mobile);

    /**
     * GET /branding_assets/getfooter_logo
     * Footer logo URL and related settings
     */
    this.router.get(`${this.path}/getfooter_logo`, this.brandingcontrollers.getfooter_logo);

    /**
     * GET /branding_assets/getfavicon
     * Favicon URL and related settings
     */
    this.router.get(`${this.path}/getfavicon`, this.brandingcontrollers.getfavicon);

}
}

export default branding_assetsRoute;