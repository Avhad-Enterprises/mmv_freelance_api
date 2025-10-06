import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import projectstaskcontroller from './projectstask.controller';
import { ProjectsTaskDto } from './projectstask.dto';
import { requireRole } from '../../middlewares/role.middleware';

class projectstaskRoute implements Route {

   public path = '/projectsTask';
   public router = Router();
   public projectstaskcontroller = new projectstaskcontroller();

   constructor() {
      this.initializeRoutes();
   }

   private initializeRoutes() {

      //projectstask section  , validationMiddleware(ProjectsTaskDto, 'body', false, [])
      this.router.post(`${this.path}/insertprojects_task`,
         requireRole('CLIENT'), // Only clients can create projects
         validationMiddleware(ProjectsTaskDto, 'body', false, []),
         this.projectstaskcontroller.insert
      );

      this.router.get(`${this.path}/getprojects_taskbyid/:id`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // Multiple roles can view
         this.projectstaskcontroller.getbytaskid
      );

      this.router.put(`${this.path}/updateprojects_taskbyid`,
         requireRole('CLIENT'), // Only clients can update their projects
         this.projectstaskcontroller.update
      );

      this.router.delete(`${this.path}/delete/:id`,
         requireRole('CLIENT'), // Only clients can delete their projects
         this.projectstaskcontroller.delete
      );

      this.router.get(`${this.path}/countactiveprojects_task`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin access for analytics
         this.projectstaskcontroller.countActiveprojectstask
      );

      this.router.get(`${this.path}/countbyprojects_task`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin access for analytics
         this.projectstaskcontroller.countprojectstask
      );

      this.router.get(`${this.path}/getallprojects_task`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users
         this.projectstaskcontroller.getallprojectstask
      );

      this.router.get(`${this.path}/getactivedeletedprojects_task`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin only
         this.projectstaskcontroller.getactivedeleted
      );

      this.router.get(`${this.path}/getDeletedprojects_task`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin only
         this.projectstaskcontroller.getDeletedprojectstask
      );

      //getall task with client info
      this.router.get(`${this.path}/tasks-with-client`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin access for client info
         this.projectstaskcontroller.getAllTasksWithClientInfo
      );

      //getbyid task with client info
      this.router.get(`${this.path}/tasks-with-client/:id`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin access for client info
         this.projectstaskcontroller.getTaskWithClientById
      );

      //url by get all data
      this.router.get(`${this.path}/getprojectstaskbyurl/:url`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // Public access for viewing
         this.projectstaskcontroller.getprojectstaskbyurl
      );

      //check url in database
      // this.router.get(`${this.path}/check-url`, this.projectstaskcontroller.checkUrlExists);
      this.router.post(`${this.path}/gettaskby`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
         this.projectstaskcontroller.getbytasksid
      );

      this.router.get(`${this.path}/count/editor/:editor_id`,
         requireRole('VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // Editor and admin access
         (req, res, next) => this.projectstaskcontroller.getCountBy(req, res, next)
      );

      this.router.get(`${this.path}/count/client/:client_id`,
         requireRole('CLIENT', 'ADMIN', 'SUPER_ADMIN'), // Client and admin access
         (req, res, next) => this.projectstaskcontroller.getClientcount(req, res, next)
      );

      // Active Clients Count
      this.router.get(`${this.path}/count/active-clients`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin analytics
         (req, res, next) => this.projectstaskcontroller.getActiveclientsCount(req, res, next)
      );

      // Active Editors Count
      this.router.get(`${this.path}/count/active-editors`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin analytics
         (req, res, next) => this.projectstaskcontroller.getActiveEditorsCount(req, res, next)
      );

      // Project Management Dashboard counts
      this.router.get(`${this.path}/completed-projects-count`,
         requireRole('ADMIN', 'SUPER_ADMIN'), // Admin dashboard
         this.projectstaskcontroller.getCompletedProjectCount
      );

      this.router.patch(`${this.path}/updatestatus`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR'), // Status updates by project participants
         this.projectstaskcontroller.updateProjectTaskStatus
      );

      this.router.get(`${this.path}/getallprojectlisting`,
         requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users
         this.projectstaskcontroller.getallprojectlisting
      );
   }
}

export default projectstaskRoute;
