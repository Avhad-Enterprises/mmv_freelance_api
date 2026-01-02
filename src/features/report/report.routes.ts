import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requirePermission } from "../../middlewares/permission.middleware";
import validationMiddleware from "../../middlewares/validation.middleware";
import reportcontroller from "./report.controller";
import { ReportDto } from "./report.dto";

class ReportsRoute implements Route {
  public path = "/report";
  public router = Router();
  public reportcontroller = new reportcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // User report creation - any authenticated user can create reports
    this.router.post(
      `${this.path}/user`,
      requirePermission("reports.create"),
      validationMiddleware(ReportDto, "body", false, []),
      this.reportcontroller.reportsuser
    );
    this.router.post(
      `${this.path}/project`,
      requirePermission("reports.create"),
      validationMiddleware(ReportDto, "body", false, []),
      this.reportcontroller.reportProject
    );

    // Admin-only endpoints for viewing/updating report status
    this.router.post(
      `${this.path}/status`,
      requirePermission("reports.view"),
      this.reportcontroller.getreportstatus
    );
    this.router.get(
      `${this.path}/getallreports`,
      requirePermission("reports.view"),
      this.reportcontroller.getAllReports
    );
    this.router.post(
      `${this.path}/statusupdate`,
      requirePermission("reports.view"),
      validationMiddleware(ReportDto, "body", false, []),
      this.reportcontroller.updateReportStatus
    );
  }
}

export default ReportsRoute;
