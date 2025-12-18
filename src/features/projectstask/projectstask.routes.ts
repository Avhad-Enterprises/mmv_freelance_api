import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import projectstaskcontroller from './projectstask.controller';
import { ProjectsTaskDto } from './projectstask.dto';
import { requirePermission } from '../../middlewares/permission.middleware';

/**
 * Projects Task Routes
 * Handles all project task-related API endpoints with role-based access control
 * Includes public listings, CRUD operations, analytics, and status management
 * 
 * Note: Project submission endpoints have been moved to submit-project feature
 */
class projectstaskRoute implements Route {

   public path = '/projects-tasks';
   public router = Router();
   public projectstaskcontroller = new projectstaskcontroller();

   constructor() {
      this.initializeRoutes();
   }

   /**
    * Initialize all project task routes with proper middleware
    */
   private initializeRoutes() {
      // ==========================================
      // PUBLIC ENDPOINTS (Register first to avoid conflicts)
      // ==========================================

      /**
       * Get public project listings
       * GET /api/v1/projects-tasks/listings
       * Public endpoint - no authentication required
       */
      this.router.get(`${this.path}/listings`, this.projectstaskcontroller.getallprojectlisting);

      // ==========================================
      // PROJECT TASK ANALYTICS & QUERIES (Register specific routes first)
      // ==========================================

      /**
       * Get various project task counts
       * GET /api/v1/projects-tasks/count
       * Query params: ?type=active|all|completed, ?client_id=X, ?freelancer_id=X
       * Requires: Permission 'projects.view'
       */
      this.router.get(`${this.path}/count`,
         requirePermission('projects.view'),
         this.projectstaskcontroller.getProjectCounts
      );

      /**
       * Get all project tasks for authenticated users
       * GET /api/v1/projects-tasks
       * Requires: Permission 'projects.view'
       */
      this.router.get(`${this.path}`,
         requirePermission('projects.view'),
         this.projectstaskcontroller.getallprojectstask
      );

      /**
       * Get project tasks for a specific client
       * GET /api/v1/projects-tasks/client/:clientId
       * Requires: Permission 'projects.view'
       */
      this.router.get(`${this.path}/client/:clientId`,
         requirePermission('projects.view'),
         this.projectstaskcontroller.getProjectsByClientId
      );

      // ==========================================
      // ANALYTICS ENDPOINTS
      // ==========================================

      /**
       * Get active clients count
       * GET /api/v1/projects-tasks/analytics/active-clients
       * Requires: Permission 'admin.analytics'
       */
      this.router.get(`${this.path}/analytics/active-clients`,
         requirePermission('admin.analytics'),
         this.projectstaskcontroller.getActiveClientsCount
      );

      /**
       * Get active editors count
       * GET /api/v1/projects-tasks/analytics/active-editors
       * Requires: Permission 'admin.analytics'
       */
      this.router.get(`${this.path}/analytics/active-editors`,
         requirePermission('admin.analytics'),
         this.projectstaskcontroller.getActiveEditorsCount
      );

      // ==========================================
      // PROJECT TASK CRUD OPERATIONS
      // ==========================================
      // Note: Submission endpoints have been moved to submit-project feature

      /**
       * Create a new project task
       * POST /api/v1/projects-tasks
       * Requires: Permission 'projects.create'
       */
      this.router.post(`${this.path}`,
         requirePermission('projects.create'),
         validationMiddleware(ProjectsTaskDto, 'body', false, []),
         this.projectstaskcontroller.insert
      );

      /**
       * Get a specific project task by ID
       * GET /api/v1/projects-tasks/:id
       * Requires: Permission 'projects.view'
       */
      this.router.get(`${this.path}/:id`,
         requirePermission('projects.view'),
         this.projectstaskcontroller.getbytaskid
      );

      /**
       * Update an existing project task
       * PUT /api/v1/projects-tasks/:id
       * Requires: Permission 'projects.update'
       */
      this.router.put(`${this.path}/:id`,
         requirePermission('projects.update'),
         this.projectstaskcontroller.update
      );

      /**
       * Delete a project task
       * DELETE /api/v1/projects-tasks/:id
       * Requires: Permission 'projects.delete'
       */
      this.router.delete(`${this.path}/:id`,
         requirePermission('projects.delete'),
         this.projectstaskcontroller.delete
      );

      // ==========================================
      // PROJECT TASK STATUS MANAGEMENT
      // ==========================================

      /**
       * Update project task status
       * PATCH /api/v1/projects-tasks/:id/status
       * Requires: Permission 'projects.update'
       */
      this.router.patch(`${this.path}/:id/status`,
         requirePermission('projects.update'),
         this.projectstaskcontroller.updateProjectTaskStatus
      );

      // Note: Project submission endpoints moved to submit-project feature
   }
}

export default projectstaskRoute;
