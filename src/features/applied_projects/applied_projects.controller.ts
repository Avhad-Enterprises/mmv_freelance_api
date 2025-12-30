import { NextFunction, Request, Response } from "express";
import { AppliedProjectsDto } from "./applied_projects.dto";
import { IAppliedProjects } from "./applied_projects.interface";
import AppliedProjectsService from "./applied_projects.service";
import HttpException from "../../exceptions/HttpException";
import { RequestWithUser } from "../../interfaces/auth.interface";

class AppliedProjectsController {
  public AppliedProjectsService = new AppliedProjectsService();

  public applyToProject = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user.user_id;
      const applicationData = {
        ...req.body,
        user_id: user_id
      };
      const result = await this.AppliedProjectsService.apply(applicationData);
      res.status(200).json({
        success: true,
        message: result.message,
        alreadyApplied: result.alreadyApplied,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  public getProjectApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const projects_task_id = parseInt(req.params.project_id);
    if (isNaN(projects_task_id)) {
      throw new HttpException(400, "Invalid Project Task ID");
    }
    const applications = await this.AppliedProjectsService.getProjectApplications(projects_task_id);
    res.status(200).json({
      success: true,
      data: applications,
      message: `got all applications for project task ID ${projects_task_id}`
    });
  };

  public getMyApplications = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user_id = req.user.user_id;
    const applications = await this.AppliedProjectsService.getUserApplications(user_id);
    res.status(200).json({
      success: true,
      data: applications,
      message: `got all applications for user ${user_id}`
    });

  };

  public getMyApplicationbyId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {

    const user_id = req.user.user_id;
    const projects_task_id = parseInt(req.params.project_id);
    if (isNaN(projects_task_id)) {
      throw new HttpException(400, "Invalid project task id");
    }
    const application = await this.AppliedProjectsService.getUserApplicationByProject(user_id, projects_task_id);
    if (!application) {
      throw new HttpException(404, "Application not found");
    }
    res.status(200).json({
      success: true,
      data: application,
      message: `got application for user ${user_id} and project task ${projects_task_id}`
    });

  };

  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { applied_projects_id, status } = req.body;
      if (!applied_projects_id || typeof status === 'undefined') {
        throw new HttpException(400, "applied_projects_id and status are required");
      }
      const updated = await this.AppliedProjectsService.updateApplicationStatus(applied_projects_id, status);
      res.status(200).json({
        success: true,
        data: updated,
        message: "Application status updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Withdraw application with automatic refund
   * DELETE /api/v1/applications/:application_id
   */
  public withdrawApplication = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { application_id } = req.params;
      const user_id = req.user.user_id;

      if (!application_id) {
        throw new HttpException(400, "application_id is required");
      }

      const result = await this.AppliedProjectsService.withdrawApplication(
        parseInt(application_id),
        user_id
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  public getApplicationCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { project_id } = req.params;

      if (!project_id) {
        throw new HttpException(400, "Project ID is required");
      }

      const count = await this.AppliedProjectsService.getApplicationCountByProject(Number(project_id));
      res.status(200).json({ success: true, project_id: Number(project_id), count });
    } catch (error) {
      next(error);
    }
  };

  public getAppliedStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.params;

      // Allow status: 0 = pending, 1 = completed, 2 = rejected
      const statusNum = parseInt(status);
      if (isNaN(statusNum) || ![0, 1, 2, 3].includes(statusNum)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be 0 (pending), 1 (ongoing), 2 (completed), or 3 (rejected)'
        });
      }

      const appliedProjects = await this.AppliedProjectsService.getAppliedprojectByStatus(statusNum);
      res.status(200).json({
        success: true,
        status: statusNum,
        data: appliedProjects
      });
    } catch (error) {
      next(error);
    }
  };

  public appliedcount = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.user.user_id;

    try {
      const count = await this.AppliedProjectsService.getAppliedCount(user_id);

      res.status(200).json({
        success: true,
        message: `Applied project count for user ${user_id} fetched successfully`,
        data: count,
      });
    } catch (error) {
      next(error);
    }
  };

  public getongoing = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user.user_id;

      const projects = await this.AppliedProjectsService.ongoingprojects(user_id);

      res.status(200).json({
        success: true,
        message: `Ongoing (Approved) projects fetched for user ID ${user_id}`,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };

  public getapplied = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user.user_id;
      const filter = req.params.filter;

      const allowedFilters = ['new', 'ongoing', 'completed'];
      if (!allowedFilters.includes(filter)) {
        throw new HttpException(400, "Invalid filter value. Allowed: new, ongoing, completed");
      }

      const projects = await this.AppliedProjectsService.getprojectsbyfilter(user_id, filter);

      res.status(200).json({
        success: true,
        message: `${filter} projects fetched successfully`,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCompletedProjectsCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.AppliedProjectsService.getCompletedProjectCount();
      res.status(200).json({
        success: true,
        data: { completed_projects: count },
        message: "Completed project count fetched successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if current user can chat with another user
   * GET /api/v1/applications/check-can-chat/:userId
   */
  public checkCanChat = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user.user_id;
      const otherUserId = parseInt(req.params.userId);

      if (isNaN(otherUserId)) {
        throw new HttpException(400, "Invalid user ID");
      }

      // Determine user role from request (set by auth middleware)
      const userRoles = req.user.roles || [];
      const isClient = userRoles.includes('CLIENT');
      const currentUserRole: 'client' | 'freelancer' = isClient ? 'client' : 'freelancer';

      const result = await this.AppliedProjectsService.checkCanChat(
        currentUserId,
        otherUserId,
        currentUserRole
      );

      res.status(200).json({
        success: true,
        canChat: result.canChat,
        reason: result.reason
      });
    } catch (error) {
      next(error);
    }
  };

}

export default AppliedProjectsController;
