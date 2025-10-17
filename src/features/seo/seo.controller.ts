import { NextFunction, Request, Response } from 'express';
import { SeoDto } from './seo.dto';
import SEOservice from './seo.service';

class SEOcontroller {

  public SEOservice = new SEOservice();

  // POST /api/SEO/insert
  // Insert a new SEO detail
  public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const userData: SeoDto = req.body;
      const insertedData = await this.SEOservice.Insert(userData);
      res.status(201).json({ data: insertedData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/SEO/getall
  // Retrieve all SEO details
  public getAllbyseodetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emails = await this.SEOservice.getAllbyseodetail();
      res.status(200).json({ data: emails, success: true });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/SEO/update
  // Update SEO detail by seodetail
  public updatebyseodetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).id;
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'id must be a number' });
        return;
      }

      // Clone body and exclude collection_id
      const fieldsToUpdate = req.body;

      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }

      const updated = await this.SEOservice.updatebyseodetail(idNum, fieldsToUpdate);
      res.status(200).json({ data: updated, message: 'SEO updated' });
    } catch (error) {
      next(error);
    }
  };

}

export default SEOcontroller;