import { NextFunction, Request, Response } from 'express';
import { SeoDto } from '../dtos/SEO.dto';
import SEOservice from '../services/SEO.services';

class SEOcontroller  {

  public SEOservice = new SEOservice();

  public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

      const userData: SeoDto = req.body;
      const insertedData = await this.SEOservice.Insert(userData);
      res.status(201).json({ data: insertedData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  public getAllbyseodetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emails = await this.SEOservice.getAllbyseodetail();
      res.status(200).json({ data: emails, success: true });
    } catch (err) {
      next(err);
    }
  };

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