import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
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
    // Allow any authenticated user roles to create reports (clients, freelancers, editors, etc.)
    this.router.post(`${this.path}/user`, requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), validationMiddleware(ReportDto, 'body', false, []), this.reportcontroller.reportsuser);
    this.router.post(`${this.path}/project`, requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), validationMiddleware(ReportDto, 'body', false, []), this.reportcontroller.reportProject);

    // Admin-only endpoints for viewing/updating report status
    this.router.post(`${this.path}/status`, requireRole('ADMIN', 'SUPER_ADMIN'), this.reportcontroller.getreportstatus);
    this.router.get(`${this.path}/getallreports`, requireRole('ADMIN', 'SUPER_ADMIN'), this.reportcontroller.getAllReports);
    this.router.post(`${this.path}/statusupdate`, requireRole('ADMIN', 'SUPER_ADMIN'), validationMiddleware(ReportDto, 'body', false, []), this.reportcontroller.updateReportStatus);

  }
}

export default ReportsRoute;
