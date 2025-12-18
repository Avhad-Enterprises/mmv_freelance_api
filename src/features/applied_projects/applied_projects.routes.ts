import { Router } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import AppliedProjectsController from './applied_projects.controller'
import { AppliedProjectsDto } from './applied_projects.dto';
import Route from '../../interfaces/routes.interface';
import { requirePermission } from '../../middlewares/permission.middleware';

class AppliedProjectsRoute implements Route {

  public path = '/applications';
  public router = Router();
  public appliedProjectsController = new AppliedProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // EDITOR APIS

    // Post Editor Apply to a project
    this.router.post(
      `${this.path}/projects/apply`,
      requirePermission('projects.apply'),
      validationMiddleware(AppliedProjectsDto, 'body', false, ['create']),
      this.appliedProjectsController.applyToProject
    );

    // Get Editors all applications
    this.router.get(
      `${this.path}/my-applications`,
      requirePermission('projects.apply'),
      this.appliedProjectsController.getMyApplications
    );

    // Get Editors applications by Project ID
    this.router.get(
      `${this.path}/my-applications/project/:project_id`,
      requirePermission('projects.apply'),
      this.appliedProjectsController.getMyApplicationbyId
    );

    // Editor Withdraw his application
    this.router.delete(
      `${this.path}/withdraw/:application_id`,
      requirePermission('projects.withdraw'),
      this.appliedProjectsController.withdrawApplication
    );

    // CLIENT APIS

    // Get all applications for a specific project
    this.router.get(
      `${this.path}/projects/:project_id/applications`,
      requirePermission('applications.view'),
      this.appliedProjectsController.getProjectApplications
    );

    // Update application status, HIRE THE EDITOR
    this.router.patch(
      `${this.path}/update-status`,
      requirePermission('projects.hire'),
      this.appliedProjectsController.updateApplicationStatus
    );

    // Get application count for a specific project
    this.router.get(
      `${this.path}/projects/:project_id/application-count`,
      requirePermission('projects.view'),
      this.appliedProjectsController.getApplicationCount
    );

    this.router.get(`${this.path}/status/:status`,
      requirePermission('projects.view'),
      this.appliedProjectsController.getAppliedStatus.bind(this.appliedProjectsController)
    );

    this.router.get(`${this.path}/count`,
      requirePermission('projects.view'),
      (req, res, next) => this.appliedProjectsController.appliedcount(req as any, res, next)
    );

    this.router.get(`${this.path}/ongoing`,
      requirePermission('projects.view'),
      (req, res, next) => this.appliedProjectsController.getongoing(req as any, res, next)
    );

    this.router.get(`${this.path}/filter/:filter`,
      requirePermission('projects.view'),
      (req, res, next) => this.appliedProjectsController.getapplied(req as any, res, next)
    );

    this.router.get(`${this.path}/projects/completed-count`,
      requirePermission('admin.analytics'), // Admin analytics
      this.appliedProjectsController.getCompletedProjectsCount
    );

  }
}
export default AppliedProjectsRoute;
