import visitorservice from '../services/visitors_logs.services';
import { VisitorLogDto } from '../dtos/visitor_logs.dto';
import HttpException from "../exceptions/HttpException";
import { NextFunction, Request, Response } from "express";

class VisitorController {
  private visitorservice = new visitorservice();

  public logvisitor = async (req: Request, res: Response) => {
    try {
      const data = (req.body);
      const result = await this.visitorservice.logVisitor(data);
      res.status(201).json({ data: result, message: 'Visitor log saved' });
    } catch (err: any) {
      res.status(400).json({ details: err.message });
    }
  };


  public getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.visitorservice.getVisitorStats();
      res.status(200).json({ message: 'Visitor stats retrieved', data: stats });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
  };

  public getvisitorby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const visitor_id = parseInt(req.body.visitor_id);
      const visitor = await this.visitorservice.getvisitorbytable(visitor_id);
      res.status(200).json({ data: visitor, success: true });
    } catch (err) {
      next(err);
    }
  }

  public getallvisitorby = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visitor = await this.visitorservice.getallvisitorbytable();
      res.status(200).json({ data: visitor, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getallvisitor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counts = await this.visitorservice.getallTableCounts();
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  public smartsearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ success: false, message: "Search query is required" });
        return;
      }
      const result = await this.visitorservice.searchAllVisitorLogs(query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getbydate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { start_date, end_date } = req.body;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          message: 'start_date and end_date are required',
        });
        return;
      }
      const result = await this.visitorservice.getbylogdate(start_date, end_date);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getbyweek = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { week } = req.body;

      if (!week) {
        res.status(400).json({
          success: false,
          message: "Week parameter is required (use 'this_week' or 'last_week')"
        });
        return;
      }
      const result = await this.visitorservice.getvisitorbyweek(week);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  public gettimefilter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filter } = req.body;

      if (!filter) {
        res.status(400).json({
          success: false,
          message: "filter is required"
        });
        return;
      }
      const result = await this.visitorservice.getvisitortimefilter(filter);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

}
export default VisitorController;
