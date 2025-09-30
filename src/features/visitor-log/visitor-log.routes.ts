import { Router } from 'express';
import Route from '../../interfaces/route.interface';

import validationMiddleware from '../../middlewares/validation.middleware';
import VisitorController from './visitor-log.controller';
import { VisitorLogDto } from './visitor-log.dto';

class visitor_logsRoute implements Route {

  public path = '/visitor';
  public router = Router();
  public VisitorController = new VisitorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //visitor_logs section  , validationMiddleware(visitor_logsDto, 'body', false, [])
    this.router.post(`${this.path}/logs`, validationMiddleware(VisitorLogDto, 'body', false, []), this.VisitorController.logvisitor);
    this.router.get(`${this.path}/statistic`, this.VisitorController.getStats);
    this.router.get(`${this.path}/getvisitor`, (req, res, next) => this.VisitorController.getvisitorby(req, res, next));
    this.router.get(`${this.path}/getallvisitor`, (req, res, next) => this.VisitorController.getallvisitorby(req, res, next));
    this.router.get(`${this.path}/visitorcount`, (req, res, next) => this.VisitorController.getallvisitor(req, res, next));
    this.router.get(`${this.path}/admin-smart-search`, (req, res, next) => this.VisitorController.smartsearch(req, res, next));
    this.router.get(`${this.path}/getdate`, (req, res, next) => this.VisitorController.getbydate(req, res, next));
    this.router.get(`${this.path}/getweek`, (req, res, next) => this.VisitorController.getbyweek(req, res, next));
     this.router.get(`${this.path}/getfilter`, (req, res, next) => this.VisitorController.gettimefilter(req, res, next));
    
  }
}

export default visitor_logsRoute;
