import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import SubmissionController from './submission.controller';
import { SubmitProjectDto } from './submit-project.dto';
import { requireRole } from '../../middlewares/role.middleware';

/**
 * Submission Routes
 * Handles all project submission-related API endpoints
 * Routes are registered under /api/v1/projects-tasks to maintain backward compatibility
 */
class SubmissionRoute implements Route {
  public path = '/projects-tasks';
  public router = Router();
  public submissionController = new SubmissionController();

  constructor() {
    this.initializeRoutes();
  }

  /**
   * Initialize all submission routes
   */
  private initializeRoutes() {
    // ==========================================
    // SUBMISSION ENDPOINTS (Register before :id routes)
    // ==========================================

    /**
     * Get all submissions (with optional filters)
     * GET /api/v1/projects-tasks/submissions
     * Query params: ?status=0|1|2, ?projects_task_id=X, ?user_id=X
     * Requires: ADMIN, SUPER_ADMIN role
     */
    this.router.get(`${this.path}/submissions`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      this.submissionController.getAllSubmissions
    );

    /**
     * Get submissions by freelancer
     * GET /api/v1/projects-tasks/submissions/freelancer/:userId
     * Requires: VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN role
     */
    this.router.get(`${this.path}/submissions/freelancer/:userId`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
      this.submissionController.getSubmissionsByFreelancer
    );

    /**
     * Get submission by ID
     * GET /api/v1/projects-tasks/submissions/:submissionId
     * Requires: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN role
     */
    this.router.get(`${this.path}/submissions/:submissionId`,
      requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
      this.submissionController.getSubmissionById
    );

    /**
     * Approve or reject a project submission
     * PATCH /api/v1/projects-tasks/submissions/:submissionId/approve
     * Requires: CLIENT, ADMIN, or SUPER_ADMIN role (clients approve their projects)
     */
    this.router.patch(`${this.path}/submissions/:submissionId/approve`,
      requireRole('CLIENT', 'ADMIN', 'SUPER_ADMIN'),
      this.submissionController.approveProjectSubmission
    );

    /**
     * Submit a project
     * POST /api/v1/projects-tasks/:id/submit
     * Requires: VIDEOGRAPHER, VIDEO_EDITOR role (freelancers submit projects)
     */
    this.router.post(`${this.path}/:id/submit`,
      requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'),
      validationMiddleware(SubmitProjectDto, 'body', false, []),
      this.submissionController.submitProject
    );

    /**
     * Get all submissions for a specific project
     * GET /api/v1/projects-tasks/:projectId/submissions
     * Requires: CLIENT, ADMIN, SUPER_ADMIN role
     */
    this.router.get(`${this.path}/:projectId/submissions`,
      requireRole('CLIENT', 'ADMIN', 'SUPER_ADMIN'),
      this.submissionController.getSubmissionsByProject
    );
  }
}

export default SubmissionRoute;
