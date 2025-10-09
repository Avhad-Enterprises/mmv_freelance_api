import { NextFunction, Request, Response } from 'express';
import { ProjectsTaskDto } from './projectstask.dto';
import { IProjectTask } from './projectstask.interface';
import ProjectstaskService from './projectstask.service';
import { RequestHandler } from 'express-serve-static-core';
import DB, { T } from '../../../database/index.schema';
import HttpException from '../../exceptions/HttpException';
import { isEmpty } from 'class-validator';
import { PROJECTS_TASK } from '../../../database/projectstask.schema';
import projectsservice from './projectstask.service';
import { validateUrlFormatWithReason } from '../../utils/validation/validateUrlformat';

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
      const projects = await this.ProjectstaskService.getById(idNum);
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
      const raw = (req.body as any).projects_task_id;
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(idNum)) {
        res.status(400).json({ error: '  "projects_task_id" must be a number' });
        return;
      }

      // Clone body and exclude code_id
      const fieldsToUpdate = req.body;

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

  public countActiveprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.ProjectstaskService.projectstaskActive();
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  };

  public countprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.ProjectstaskService.countprojectstask();
      res.status(200).json({ count });
    } catch (err) {
      next(err);
    }
  };

  public getallprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getAllProjectsTask();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getactivedeleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getactivedeleted();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getDeletedprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getDeletedprojectstask();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getAllTasksWithClientInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await this.ProjectstaskService.getTasksWithClientInfo();
      res.status(200).json({ data: tasks, success: true });
    } catch (error) {
      next(error);
    }
  };

  public getTaskWithClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const tasks = await this.ProjectstaskService.getTaskWithClientById(Number(id));

      res.status(200).json({ data: tasks, success: true });
    } catch (error) {
      next(error);
    }
  };

  public getprojectstaskbyurl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = req.params.url;

      if (!url) {
        res.status(400).json({ message: "URL is required" });
        return;
      }

      const projecttask = await this.ProjectstaskService.getByUrl(url);

      if (!projecttask) {
        res.status(404).json({ message: "projects task not found" });
        return;
      }

      res.status(200).json({ data: projecttask });
    } catch (error) {
      next(error);
    }
  };

  public checkUrlExists = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ message: 'URL is required' });
        return;
      }

      // 🔍 Validate format with specific error
      const { valid, reason } = validateUrlFormatWithReason(url);

      if (!valid) {
        res.status(400).json({ message: `Invalid URL format: ${reason}` });
        return;
      }

      const exists = await this.ProjectstaskService.checkUrlInprojects(url);

      if (exists) {
        res.status(200).json({ message: 'URL exists in projects task table', url });
      } else {
        res.status(404).json({ message: 'URL not found in projects task table', url });
      }

    } catch (error: any) {
      console.error("checkUrlExists error:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  public getbytasksid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { client_id, is_active } = req.body;


      const idNum: number = typeof client_id === 'string'
        ? parseInt(client_id, 10)
        : client_id;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'projects_task_id must be a number' });
        return;
      }


      const activeStatus: number = typeof is_active === 'string'
        ? parseInt(is_active, 10)
        : is_active ? 1 : 0;

      if (isNaN(activeStatus) || (activeStatus !== 0 && activeStatus !== 1)) {
        res.status(400).json({ error: 'is_active must be 1 or 0' });
        return;
      }


      const project = await this.ProjectstaskService.getBytaskId(idNum, activeStatus);

      if (!project) {
        res.status(404).json({ error: 'projects_task not found' });
        return;
      }

      res.status(200).json({ project, success: true });
    } catch (error) {
      next(error);
    }
  };

  public getProjectsByClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { client_id } = req.params;

      const idNum: number = typeof client_id === 'string'
        ? parseInt(client_id, 10)
        : client_id;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'client_id must be a number' });
        return;
      }

      const projects = await this.ProjectstaskService.getProjectsByClient(idNum);

      res.status(200).json({ data: projects, success: true });
    } catch (error) {
      next(error);
    }
  };

  public getCountBy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { editor_id } = req.params;

      const count = await this.ProjectstaskService.getCountByEditor(Number(editor_id));

      res.status(200).json({
        success: true,
        editor_id: Number(editor_id),
        shortlisted_count: count
      });
    } catch (error) {
      next(error);
    }
  };

  public getClientcount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { client_id } = req.params;

      const count = await this.ProjectstaskService.getCountByClient(Number(client_id));

      res.status(200).json({
        success: true,
        client_id: Number(client_id),
        projects_count: count
      });
    } catch (error) {
      next(error);
    }
  };

  public getActiveclientsCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.ProjectstaskService.getActiveclientsCount();

      res.status(200).json({
        success: true,
        active_clients_count: count
      });
    } catch (error) {
      next(error);
    }
  };

  public getActiveEditorsCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.ProjectstaskService.getActiveEditorsCount();

      res.status(200).json({
        success: true,
        active_editors_count: count
      });
    } catch (error) {
      next(error);
    }
  };

  public getCompletedProjectCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.ProjectstaskService.getCompletedProjectCount();
      res.status(200).json({ count, message: 'Completed projects count fetched successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateProjectTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projects_task_id, status, user_id } = req.body;

      if (!projects_task_id || typeof status === 'undefined') {
        throw new HttpException(400, "projects_task_id and status are required");
      }

      const updated = await this.ProjectstaskService.updateProjectTaskStatus(
        projects_task_id,
        status,
        user_id
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

  public getallprojectlistingPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getAllProjectslistingPublic();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };
}

export default projectstaskcontroller;