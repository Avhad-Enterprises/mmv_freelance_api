import { NextFunction, Request, Response } from 'express';
import { ProjectsTaskDto } from './projectstask.dto';
import { IProjectTask } from './projectstask.interface';
import ProjectstaskService from './projectstask.service';
import { RequestHandler } from 'express-serve-static-core';
import DB, { T } from '../../../database/index';
import HttpException from '../../exceptions/HttpException';
import { isEmpty } from 'class-validator';
import { PROJECTS_TASK } from '../../../database/projectstask.schema';
import { RequestWithUser } from '../../interfaces/auth.interface';

/**
 * Projects Task Controller
 * Handles HTTP request/response for project task-related operations
 * 
 * Note: Project submission controllers have been moved to submit-project feature
 */
class projectstaskcontroller {

  public ProjectstaskService = new ProjectstaskService();

  public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
      const userData: ProjectsTaskDto = req.body;
      const createdproject = await this.ProjectstaskService.Insert(userData);
      res.status(201).json({ data: createdproject, message: "Inserted" });
    } catch (error) {
      console.error('Insert Project Task Error:', error);
      next(error);
    }
  };

  public getbytaskid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.id;
      const idNum: number = typeof raw === 'string'
        ? parseInt(raw, 10)
        : raw;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'project_task_id must be a number' });
        return;
      }

      const { include } = req.query;
      const projects = await this.ProjectstaskService.getProjectById(idNum, { include: include as string });

      if (!projects) {
        res.status(404).json({ error: 'projects_task not found' });
        return;
      }

      res.status(200).json({ projects, success: true });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.id;
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'projects_task_id must be a number' });
        return;
      }

      // Clone body and exclude projects_task_id if present
      const { projects_task_id, ...fieldsToUpdate } = req.body;

      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }

      const updated = await this.ProjectstaskService.update(idNum, fieldsToUpdate);
      res.status(200).json({ data: updated, message: 'projects_task updated' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.id;
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'projects_task_id must be a number' });
        return;
      }

      const deleted = await this.ProjectstaskService.softDelete(idNum, { is_deleted: true });
      res.status(200).json({ data: deleted, message: 'projects_task deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getallprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, include, client_id, url, is_active } = req.query;

      const projects = await this.ProjectstaskService.getProjects({
        status: status as string,
        include: include as string,
        client_id: client_id as string,
        url: url as string,
        is_active: is_active as string
      });

      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getProjectCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, client_id, freelancer_id } = req.query;

      const result = await this.ProjectstaskService.getProjectCounts({
        type: type as string,
        client_id: client_id as string,
        freelancer_id: freelancer_id as string
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateProjectTaskStatus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.id;
      const projects_task_id = typeof raw === 'string' ? parseInt(raw, 10) : raw;
      const { status, user_id } = req.body;

      if (!projects_task_id || typeof status === 'undefined') {
        throw new HttpException(400, "projects_task_id and status are required");
      }

      // Validate status value (0: pending, 1: assigned, 2: completed)
      if (status !== 0 && status !== 1 && status !== 2) {
        throw new HttpException(400, "Invalid status value. Must be 0 (pending), 1 (assigned), or 2 (completed)");
      }

      const updated = await this.ProjectstaskService.updateProjectTaskStatus(
        projects_task_id,
        status,
        user_id,
        req.user?.roles?.[0] // Pass the user's primary role
      );

      res.status(200).json({
        data: updated,
        message: "Project task status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getallprojectlisting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getAllProjectslisting();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getProjectsByClientId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.clientId;
      const clientId: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(clientId)) {
        res.status(400).json({ error: 'client_id must be a number' });
        return;
      }

      const projects = await this.ProjectstaskService.getProjectsByClient(clientId);
      res.status(200).json({ data: projects, success: true });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active clients count
   * GET /api/v1/projects-tasks/analytics/active-clients
   */
  public getActiveClientsCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.ProjectstaskService.getActiveclientsCount();
      res.status(200).json({ 
        count,
        type: 'active_clients',
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active editors count
   * GET /api/v1/projects-tasks/analytics/active-editors
   */
  public getActiveEditorsCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.ProjectstaskService.getActiveEditorsCount();
      res.status(200).json({ 
        count,
        type: 'active_editors',
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  // Note: Submission controller methods moved to submit-project feature
}

export default projectstaskcontroller;