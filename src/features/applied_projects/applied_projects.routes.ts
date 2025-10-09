import { Router } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import AppliedProjectsController from './applied_projects.controller'
import { AppliedProjectsDto } from './applied_projects.dto';
import Route from '../../interfaces/routes.interface';
import { RequestHandler } from 'express';
import { requireRole } from '../../middlewares/role.middleware';

class AppliedProjectsRoute implements Route {

  public path = '/applications';
  public router = Router();
  public appliedProjectsController = new AppliedProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // EDITOR APIS

    // Post Editor Apply to a project - DONE
    this.router.post(
      `${this.path}/projects/apply`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'), // Only editors can apply
      validationMiddleware(AppliedProjectsDto, 'body', false, ['create']),
      this.appliedProjectsController.applyToProject
    );

    // Get Editors all applications - DONE
    this.router.post(
      `${this.path}/my-applications`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'), // Only editors can view their applications
      this.appliedProjectsController.getMyApplications
    );

    // Get Editors applications by Project ID - DONE
    this.router.post(
      `${this.path}/my-applications/project`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'), // Only editors can view their applications
      this.appliedProjectsController.getMyApplicationbyId
    );

    // Editor Withdraw his application - DONE
    this.router.delete(
      `${this.path}/my-applications/withdraw`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'), // Only editors can withdraw
      this.appliedProjectsController.withdrawApplication
    );

    // CLIENT APIS

    // Get all applications for a specific project  - DONE
    this.router.post(
      `${this.path}/projects/get-applications`,
      requireRole('CLIENT'), // Only clients can view applications for their projects
      this.appliedProjectsController.getProjectApplications
    ); // enter project_task_id here 

    // Update application status, HIRE THE EDITOR - DONE 
    this.router.patch(
      `${this.path}/update-status`,
      requireRole('CLIENT'), // Only clients can update application status
      this.appliedProjectsController.updateApplicationStatus
    );

    // Get application count for a specific project - NEW
    this.router.post(
      `${this.path}/projects/get-application-count`,
      requireRole('CLIENT','ADMIN', 'SUPER_ADMIN'), // Only clients can view application counts
      this.appliedProjectsController.getApplicationCount
    ); // enter project_task_id here

    this.router.post(`${this.path}/getStatus`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR', 'CLIENT'), // Editors and clients can check status
      this.appliedProjectsController.getAppliedStatus.bind(this.appliedProjectsController)
    );
    
    this.router.get(`${this.path}/count/:id`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // Editors and admins can view counts
      (req, res, next) => this.appliedProjectsController.appliedcount(req, res, next)
    );
    
    this.router.get(`${this.path}/ongoing/:user_id`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR', 'CLIENT', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users
      (req, res, next) => this.appliedProjectsController.getongoing(req, res, next)
    );
    
    this.router.get(`${this.path}/:user_id`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR', 'CLIENT', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users
      (req, res, next) => this.appliedProjectsController.getapplied(req, res, next)
    );

    this.router.get(`${this.path}/projects/completed-count`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Admin analytics
      this.appliedProjectsController.getCompletedProjectsCount
    );


  }
}
export default AppliedProjectsRoute;