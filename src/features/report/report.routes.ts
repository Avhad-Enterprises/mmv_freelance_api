import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import reportcontroller from './report.controller';
import { ReportDto } from './report.dto';

class ReportsRoute implements Route {

  public path = '/report';
  public router = Router();
  public reportcontroller = new reportcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //report_system section  , validationMiddleware(reportDto, 'body', false, [])
    this.router.post(`${this.path}/user`, validationMiddleware(ReportDto, 'body', false, []), this.reportcontroller.reportsuser);
    this.router.post(`${this.path}/project`, validationMiddleware(ReportDto, 'body', false, []), this.reportcontroller.reportProject);
    this.router.post(`${this.path}/status`, this.reportcontroller.getreportstatus);
    this.router.get(`${this.path}/getallreports`, this.reportcontroller.getAllReports);
    this.router.post(`${this.path}/statusupdate`, validationMiddleware(ReportDto, 'body', false, []), this.reportcontroller.updateReportStatus);

  }
}

export default ReportsRoute;
