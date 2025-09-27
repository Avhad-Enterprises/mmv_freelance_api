import { Router } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import AppliedProjectsController from '../controllers/applied_projects.controllers'
import { AppliedProjectsDto } from '../dtos/applied_projects.dto';
import Route from '../interfaces/routes.interface';
import { RequestHandler } from 'express';

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
      validationMiddleware(AppliedProjectsDto, 'body', false, ['create']),
      this.appliedProjectsController.applyToProject
    );

    // Get Editors all applications - DONE
    this.router.post(
      `${this.path}/my-applications`,
      this.appliedProjectsController.getMyApplications
    );

    // Get Editors applications by Project ID - DONE
    this.router.post(
      `${this.path}/my-applications/project`,
      this.appliedProjectsController.getMyApplicationbyId
    );

    // Editor Withdraw his application - DONE
    this.router.delete(
      `${this.path}/my-applications/withdraw`,
      this.appliedProjectsController.withdrawApplication
    );

    // CLIENT APIS

    // Get all applications for a specific project  - DONE
    this.router.post(
      `${this.path}/projects/get-applications`,
      this.appliedProjectsController.getProjectApplications
    ); // enter project_task_id here 

    // Update application status, HIRE THE EDITOR - DONE 
    this.router.patch(
      `${this.path}/update-status`,
      this.appliedProjectsController.updateApplicationStatus
    );

    // Get application count for a specific project - NEW
    this.router.post(
      `${this.path}/projects/get-application-count`,
      this.appliedProjectsController.getApplicationCount
    ); // enter project_task_id here

    this.router.post(`${this.path}/getStatus`, this.appliedProjectsController.getAppliedStatus.bind(this.appliedProjectsController));
    this.router.get(`${this.path}/count/:id`, (req, res, next) => this.appliedProjectsController.appliedcount(req, res, next));
    this.router.get(`${this.path}/ongoing/:user_id`, (req, res, next) => this.appliedProjectsController.getongoing(req, res, next));
    this.router.get(`${this.path}/:user_id`, (req, res, next) => this.appliedProjectsController.getapplied(req, res, next));

    this.router.get(`${this.path}/projects/completed-count`, this.appliedProjectsController.getCompletedProjectsCount);


  }
}
export default AppliedProjectsRoute;