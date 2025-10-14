import { Router } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import ReportTemplateController from './report-templates.controller';
import { ReportTemplateDTO } from './report-templates.dto';
import Route from '../../interfaces/route.interface';


class report_templatesRoute implements Route {

  public path = '/reports';
  public router = Router();
  public ReportTemplateController = new ReportTemplateController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //robots_txt section  , validationMiddleware(robotsDto, 'body', false, [])
  // Admin only: manage report templates
  this.router.post(`${this.path}/save`, requireRole('ADMIN', 'SUPER_ADMIN'), validationMiddleware(ReportTemplateDTO, 'body', false, []), this.ReportTemplateController.insert);
  this.router.get(`${this.path}/viewall`, requireRole('ADMIN', 'SUPER_ADMIN'), this.ReportTemplateController.getall);
  this.router.post(`${this.path}/update`, requireRole('ADMIN', 'SUPER_ADMIN'), validationMiddleware(ReportTemplateDTO, 'body', false, []), this.ReportTemplateController.update);
  this.router.post(`${this.path}/delete`, requireRole('ADMIN', 'SUPER_ADMIN'), validationMiddleware(ReportTemplateDTO, 'body', false, []), this.ReportTemplateController.delete);
  this.router.post(`${this.path}/run`, requireRole('ADMIN', 'SUPER_ADMIN'), this.ReportTemplateController.getbyid);

  }
}

export default report_templatesRoute;
