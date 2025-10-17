import { NextFunction, Request, Response } from 'express';
import { BrandingAssetsDto } from './branding.dto';
import branding_assetsservices from './branding.service';

class brandingcontrollers  {

  public branding_assetsservices = new branding_assetsservices();

  /**
   * Updates branding assets configuration
   * Updates one or more branding assets (logos, favicon) and their settings.
   * All fields are optional to allow partial updates.
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: BrandingAssetsDto = req.body;
      const insertedData = await this.branding_assetsservices.update(userData);
      res.status(201).json({ data: insertedData, message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves all branding assets configuration
   * Returns all active branding assets including URLs and settings
   * for logos and favicon in a single response.
   */
  public getallbranding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emails = await this.branding_assetsservices.getAll();
      res.status(200).json({ data: emails, success: true , message: "branding assets uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Gets desktop navigation bar logo
   * Returns the URL and settings for the main desktop navbar logo.
   */
  public getNavbarLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getNavbarLogo();
      res.status(200).json({ data: logo, success: true , message: "NavbarLogo uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Gets mobile navigation bar logo
   */
  public getnavbar_logo_mobile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getnavbar_logo_mobile();
      res.status(200).json({ data: logo, success: true , message: "navbar_logo_mobile uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Gets website footer logo
   * Returns the URL and settings for the website footer logo.
   * This may be a different variant than the navbar logo.
   */
  public getfooter_logo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logo = await this.branding_assetsservices.getfooter_logo();
      res.status(200).json({ data: logo, success: true , message: "footer_logo uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Gets website favicon
   * Returns the URL and settings for the website favicon.
   * This should be an ICO or PNG file suitable for browser tabs.
   */
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