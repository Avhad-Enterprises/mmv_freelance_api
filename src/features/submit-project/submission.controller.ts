import { NextFunction, Request, Response } from 'express';
import SubmissionService from './submission.service';
import { SubmitProjectDto } from './submit-project.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';

class SubmissionController {
  public submissionService = new SubmissionService();

  /**
   * Submit a project
   * POST /api/v1/projects-tasks/:id/submit
   */
  public submitProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.id;
      const projects_task_id = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(projects_task_id)) {
        res.status(400).json({ error: 'projects_task_id must be a number' });
        return;
      }

      const submitData: SubmitProjectDto = {
        ...req.body,
        projects_task_id
      };

      const submission = await this.submissionService.submit(submitData);
      res.status(201).json({ 
        data: submission, 
        message: 'Project submitted successfully',
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Approve/reject a project submission
   * PATCH /api/v1/projects-tasks/submissions/:submissionId/approve
   */
  public approveProjectSubmission = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.submissionId;
      const submission_id = typeof raw === 'string' ? parseInt(raw, 10) : raw;
      const { status } = req.body;

      if (isNaN(submission_id)) {
        res.status(400).json({ error: 'submission_id must be a number' });
        return;
      }

      if (status === undefined || (status !== 0 && status !== 1 && status !== 2)) {
        res.status(400).json({ 
          error: 'status is required and must be 0 (pending), 1 (approved), or 2 (rejected)' 
        });
        return;
      }

      const approved = await this.submissionService.approve(submission_id, status, { 
        updated_by: req.user?.user_id 
      });
      res.status(200).json({ 
        data: approved, 
        message: 'Submission status updated successfully',
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get submission by ID
   * GET /api/v1/projects-tasks/submissions/:submissionId
   */
  public getSubmissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.submissionId;
      const submission_id = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(submission_id)) {
        res.status(400).json({ error: 'submission_id must be a number' });
        return;
      }

      const submission = await this.submissionService.getSubmissionById(submission_id);

      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      res.status(200).json({ 
        data: submission, 
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all submissions for a project
   * GET /api/v1/projects-tasks/:projectId/submissions
   */
  public getSubmissionsByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.projectId;
      const projects_task_id = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(projects_task_id)) {
        res.status(400).json({ error: 'projects_task_id must be a number' });
        return;
      }

      const submissions = await this.submissionService.getSubmissionsByProject(projects_task_id);

      res.status(200).json({ 
        data: submissions, 
        count: submissions.length,
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all submissions by a freelancer
   * GET /api/v1/projects-tasks/submissions/freelancer/:userId
   */
  public getSubmissionsByFreelancer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params.userId;
      const user_id = typeof raw === 'string' ? parseInt(raw, 10) : raw;

      if (isNaN(user_id)) {
        res.status(400).json({ error: 'user_id must be a number' });
        return;
      }

      const submissions = await this.submissionService.getSubmissionsByFreelancer(user_id);

      res.status(200).json({ 
        data: submissions, 
        count: submissions.length,
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all submissions (with optional filters)
   * GET /api/v1/projects-tasks/submissions
   */
  public getAllSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, projects_task_id, user_id } = req.query;

      const filters: any = {};
      
      if (status !== undefined) {
        const statusNum = parseInt(status as string, 10);
        if (!isNaN(statusNum)) {
          filters.status = statusNum;
        }
      }
      
      if (projects_task_id) {
        const projectIdNum = parseInt(projects_task_id as string, 10);
        if (!isNaN(projectIdNum)) {
          filters.projects_task_id = projectIdNum;
        }
      }
      
      if (user_id) {
        const userIdNum = parseInt(user_id as string, 10);
        if (!isNaN(userIdNum)) {
          filters.user_id = userIdNum;
        }
      }

      const submissions = await this.submissionService.getAllSubmissions(filters);

      res.status(200).json({ 
        data: submissions, 
        count: submissions.length,
        success: true 
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SubmissionController;
