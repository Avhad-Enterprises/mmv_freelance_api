import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import projectstaskcontroller from './projectstask.controller';
import { ProjectsTaskDto } from './projectstask.dto';
import { requireRole } from '../../middlewares/role.middleware';

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
       * Requires: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, or SUPER_ADMIN role
       */
      this.router.get(`${this.path}/count`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
         this.projectstaskcontroller.getProjectCounts
      );

      /**
       * Get all project tasks for authenticated users
       * GET /api/v1/projects-tasks
       * Requires: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, or SUPER_ADMIN role
       */
      this.router.get(`${this.path}`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users
         this.projectstaskcontroller.getallprojectstask
      );

      /**
       * Get project tasks for a specific client
       * GET /api/v1/projects-tasks/client/:clientId
       * Requires: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, or SUPER_ADMIN role
       */
      this.router.get(`${this.path}/client/:clientId`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
         this.projectstaskcontroller.getProjectsByClientId
      );

      // ==========================================
      // ANALYTICS ENDPOINTS
      // ==========================================

      /**
       * Get active clients count
       * GET /api/v1/projects-tasks/analytics/active-clients
       * Requires: ADMIN or SUPER_ADMIN role
       */
      this.router.get(`${this.path}/analytics/active-clients`,
         requireRole('ADMIN', 'SUPER_ADMIN'),
         this.projectstaskcontroller.getActiveClientsCount
      );

      /**
       * Get active editors count
       * GET /api/v1/projects-tasks/analytics/active-editors
       * Requires: ADMIN or SUPER_ADMIN role
       */
      this.router.get(`${this.path}/analytics/active-editors`,
         requireRole('ADMIN', 'SUPER_ADMIN'),
         this.projectstaskcontroller.getActiveEditorsCount
      );

      // ==========================================
      // PROJECT TASK CRUD OPERATIONS
      // ==========================================
      // Note: Submission endpoints have been moved to submit-project feature

      /**
       * Create a new project task
       * POST /api/v1/projects-tasks
       * Requires: CLIENT, ADMIN, or SUPER_ADMIN role
       */
      this.router.post(`${this.path}`,
         requireRole('CLIENT', 'ADMIN', 'SUPER_ADMIN'), // Only clients can create projects
         validationMiddleware(ProjectsTaskDto, 'body', false, []),
         this.projectstaskcontroller.insert
      );

      /**
       * Get a specific project task by ID
       * GET /api/v1/projects-tasks/:id
       * Requires: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, or SUPER_ADMIN role
       */
      this.router.get(`${this.path}/:id`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // Multiple roles can view
         this.projectstaskcontroller.getbytaskid
      );      /**
       * Update an existing project task
       * PUT /api/v1/projects-tasks/:id
       * Requires: CLIENT, ADMIN, or SUPER_ADMIN role
       */
      this.router.put(`${this.path}/:id`,
         requireRole('CLIENT','ADMIN', 'SUPER_ADMIN'), // Only clients can update their projects
         this.projectstaskcontroller.update
      );

      /**
       * Delete a project task
       * DELETE /api/v1/projects-tasks/:id
       * Requires: CLIENT, ADMIN, or SUPER_ADMIN role
       */
      this.router.delete(`${this.path}/:id`,
         requireRole('CLIENT','ADMIN', 'SUPER_ADMIN'), // Only clients can delete their projects
         this.projectstaskcontroller.delete
      );

      // ==========================================
      // PROJECT TASK STATUS MANAGEMENT
      // ==========================================

      /**
       * Update project task status
       * PATCH /api/v1/projects-tasks/:id/status
       * Requires: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, or SUPER_ADMIN role
       */
      this.router.patch(`${this.path}/:id/status`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // Status updates by project participants and admins
         this.projectstaskcontroller.updateProjectTaskStatus
      );

      // Note: Project submission endpoints moved to submit-project feature
   }
}

export default projectstaskRoute;
