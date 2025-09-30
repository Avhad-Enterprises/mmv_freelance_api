import { NextFunction, Request, Response } from 'express';
import { BrandingAssetsDto } from './branding.dto';
import branding_assetsservices from './branding.service';

class brandingcontrollers  {

  public branding_assetsservices = new branding_assetsservices();

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

      const userData: BrandingAssetsDto = req.body;
      const insertedData = await this.branding_assetsservices.update(userData);
      res.status(201).json({ data: insertedData, message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  public getallbranding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emails = await this.branding_assetsservices.getAll();
      res.status(200).json({ data: emails, success: true , message: "brandig assets uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  public getNavbarLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getNavbarLogo();
      res.status(200).json({ data: logo, success: true , message: "NavbarLogo uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  public getnavbar_logo_mobile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getnavbar_logo_mobile();
      res.status(200).json({ data: logo, success: true , message: "navbar_logo_mobile uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  public getfooter_logo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getfooter_logo();
      res.status(200).json({ data: logo, success: true , message: "footer_logo uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  public getfavicon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getfavicon();
      res.status(200).json({ data: logo, success: true , message: "favicon uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };


}

export default brandingcontrollers;