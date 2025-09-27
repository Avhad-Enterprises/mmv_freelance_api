import { Router } from 'express';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import ReportTemplateController from '../controllers/report_templates.controllers';
import { ReportTemplateDTO } from '../dtos/report_templates.dto';
import Route from '../interfaces/route.interface';


class report_templatesRoute implements Route {

  public path = '/reports';
  public router = Router();
  public ReportTemplateController = new ReportTemplateController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //robots_txt section  , validationMiddleware(robotsDto, 'body', false, [])
    this.router.post(`${this.path}/save`, validationMiddleware(ReportTemplateDTO, 'body', false, []),this.ReportTemplateController.insert);
    this.router.get(`${this.path}/viewall`, this.ReportTemplateController.getall);
    this.router.post(`${this.path}/update`, validationMiddleware(ReportTemplateDTO, 'body', false, []),this.ReportTemplateController.update);
    this.router.post(`${this.path}/delete`, validationMiddleware(ReportTemplateDTO, 'body', false, []),this.ReportTemplateController.delete);
    this.router.post(`${this.path}/run`, this.ReportTemplateController.getbyid);

  }
}

export default report_templatesRoute;
