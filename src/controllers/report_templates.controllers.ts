import { NextFunction, Request, Response } from 'express';
import ReportTemplateService from '../services/report_templates.services';
import { ReportTemplateDTO } from '../dtos/report_templates.dto';
import HttpException from "../exceptions/HttpException";
import createHttpError from 'http-errors';

 class ReportTemplateController {
    public ReportTemplateService = new ReportTemplateService();

    public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
      const userData: ReportTemplateDTO = req.body;
      const insertedData = await this.ReportTemplateService.Insertbyreport(userData);
      res.status(201).json({ data: insertedData, message: "Inserted" });
    } catch (error) {
      next(error);

    }
  };

  public getall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.ReportTemplateService.getAll();
      res.status(200).json({ data: templates, message: 'Fetched all report templates' });
    } catch (error) {
      console.error('Error in getall:', error);
      res.status(500).json({ message: 'Failed to fetch report templates' });
    }
  };
    
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).id;

      if (isNaN(raw)) {
        res.status(400).json({ error: 'id must be a required' });
        return;
      }

      // Clone body and exclude code_id
      const fieldsToUpdate  = req.body;

      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }

      const updated = await this.ReportTemplateService.update(raw, fieldsToUpdate);
      res.status(200).json({ data: updated, message: 'report_template updated' });
    } catch (error) {
      next(error);
    }
  };


  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).id;
     
      if (isNaN(raw)) {
        res.status(400).json({ error: 'id must be a required' });
        return;
      }

      // Clone body and exclude code_id
      const fieldsToUpdate  = req.body;

      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }

      const updated = await this.ReportTemplateService.delete(raw, fieldsToUpdate);
      res.status(200).json({ data:updated, message: 'report_template updated' });
    } catch (error) {
      next(error); 
    }
  };
        
  public getbyid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    
    try {
      const raw = (req.body as any).id;
    const idNum: number = typeof raw === 'string'
      ? parseInt(raw, 10)
      : raw;
    if (isNaN(idNum)) {
      res.status(400).json({ error: 'id must be a number' });
      return;
    }
    const report = await this.ReportTemplateService.getById(idNum);
    if (!report) {
      res.status(404).json({ error: 'report templates not found' });
      return;
    }

    res.status(200).json({ report, success: true });
  } catch (error) {
    next(error);
  }
};

}


export default ReportTemplateController;
