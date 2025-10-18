
import { NextFunction, Request, Response } from 'express';
import { ReportDto } from './report.dto';
import reportservices from './report.service';
import { RequestHandler } from 'express-serve-static-core';
import DB, { T } from '../../../database/index';
import HttpException from '../../exceptions/HttpException';
import { isEmpty } from 'class-validator';


class reportcontroller {

    public reportservices = new reportservices();

    public reportsuser = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = { ...req.body, report_type: 'user' };
            const report = await this.reportservices.reportsuser(dto);
            res.status(201).json(report);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    };

    public reportProject = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = { ...req.body, report_type: 'project' };  // Inject report_type manually
            const result = await this.reportservices.reportProject(dto);
            res.status(201).json({ data: result, message: 'Project reported successfully' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    };

    // Get report by ID
    public getreportstatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { report_id } = req.body;

            if (!report_id || isNaN(Number(report_id))) {
                res.status(400).json({ error: 'Invalid or missing report_id' });
                return;
            }

            const report = await this.reportservices.getReportById(Number(report_id));

            if (!report) {
                res.status(404).json({ message: 'Report not found' });
            } else {
                res.status(200).json({ data: report, message: 'Report found' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Admin: Get all reports
    public getAllReports = async (_req: Request, res: Response): Promise<void> => {
        try {
            const reports = await this.reportservices.getAllReports();

            res.status(200).json({ total: reports.length, data: reports, message: 'All reports fetched successfully'});
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    public updateReportStatus = async (req: Request, res: Response): Promise<void> => {
        try {
          const updated = await this.reportservices.updateReportStatus(req.body);
    
          if (updated === 0) {
            res.status(404).json({ message: 'Report not found or update failed' });
          } else {
            res.status(200).json({ message: 'Report status updated successfully' });
          }
        } catch (err) {
          res.status(400).json({ error: err.message });
        }
      };    
      
}

export default reportcontroller; 
