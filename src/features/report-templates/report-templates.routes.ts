import { Router } from "express";
import validationMiddleware from "../../middlewares/validation.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import ReportTemplateController from "./report-templates.controller";
import { ReportTemplateDTO } from "./report-templates.dto";
import Route from "../../interfaces/route.interface";

class report_templatesRoute implements Route {
  public path = "/reports";
  public router = Router();
  public ReportTemplateController = new ReportTemplateController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Admin only: manage report templates
    this.router.post(
      `${this.path}/save`,
      requirePermission("reports.create"),
      validationMiddleware(ReportTemplateDTO, "body", false, []),
      this.ReportTemplateController.insert
    );
    this.router.get(
      `${this.path}/viewall`,
      requirePermission("reports.view"),
      this.ReportTemplateController.getall
    );
    this.router.put(
      `${this.path}/update`,
      requirePermission("reports.create"),
      validationMiddleware(ReportTemplateDTO, "body", false, []),
      this.ReportTemplateController.update
    );
    this.router.post(
      `${this.path}/delete`,
      requirePermission("reports.create"),
      validationMiddleware(ReportTemplateDTO, "body", false, []),
      this.ReportTemplateController.delete
    );
    this.router.post(
      `${this.path}/run`,
      requirePermission("reports.view"),
      this.ReportTemplateController.getbyid
    );
  }
}

export default report_templatesRoute;
