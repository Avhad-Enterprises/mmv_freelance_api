import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { SubmitProjectDto } from "./submit-project.dto";
import { SUBMITTED_PROJECTS } from "../../../database/submitted_projects.schema";
import NotificationService from "../notification/notification.service";

/**
 * Submission Service
 * 
 * PROJECT WORKFLOW AND STATUS MANAGEMENT:
 * 
 * 1. Client posts job → Project Task Status = 0 (Pending/Awaiting Assignment)
 * 
 * 2. Freelancer applies → Application Status = 0 (Pending)
 *                      → Project Task Status = still 0 (Awaiting Assignment)
 * 
 * 3. Client approves application → Application Status = 1 (Approved)
 *                                → Project Task Status = 1 (Assigned/In Progress)
 *                                → project.freelancer_id is set
 * 
 * 4. Freelancer submits work → Submission Status = 0 (Pending Review)
 *                            → Application Status = still 1 (Approved)
 *                            → Project Task Status = still 1 (In Progress)
 * 
 * 5. Client approves submission → Submission Status = 1 (Approved)
 *                               → Application Status = 2 (Completed)
 *                               → Project Task Status = 2 (Completed)
 * 
 * STATUS CODES:
 * - Project Task Status: 0 = Pending, 1 = Assigned/In Progress, 2 = Completed
 * - Application Status: 0 = Pending, 1 = Approved, 2 = Completed, 3 = Rejected
 * - Submission Status: 0 = Pending Review, 1 = Approved, 2 = Rejected
 */

class SubmissionService {
  private notificationService = new NotificationService();

  /**
   * Submit a project
   */
  public async submit(data: SubmitProjectDto): Promise<any> {
    if (!data.projects_task_id || !data.user_id) {
      throw new HttpException(400, "Project Task ID and User ID are required");
    }

    // Check for pending or approved submissions (block these)
    const activeSubmission = await DB(SUBMITTED_PROJECTS)
      .where({
        projects_task_id: data.projects_task_id,
        user_id: data.user_id,
        is_deleted: false
      })
      .whereIn('status', [0, 1])  // 0 = pending, 1 = approved
      .first();

    if (activeSubmission) {
      if (activeSubmission.status === 0) {
        throw new HttpException(409, "Submission already pending review. Please wait for client feedback.");
      }
      if (activeSubmission.status === 1) {
        throw new HttpException(409, "Submission already approved. No further submission needed.");
      }
    }

    // If there's a rejected submission, mark it as superseded/deleted
    const rejectedSubmission = await DB(SUBMITTED_PROJECTS)
      .where({
        projects_task_id: data.projects_task_id,
        user_id: data.user_id,
        status: 2,  // Rejected
        is_deleted: false
      })
      .first();

    if (rejectedSubmission) {
      // Mark old rejected submission as deleted/superseded
      await DB(SUBMITTED_PROJECTS)
        .where({ submission_id: rejectedSubmission.submission_id })
        .update({
          is_deleted: true,
          updated_at: new Date()
        });
    }

    const submitData = {
      ...data,
      status: data.status ?? 0, // 0 = pending
      is_active: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const submitted_project = await DB(T.SUBMITTED_PROJECTS)
      .insert(submitData)
      .returning("*");

    // Fetch project details to get client_id and project_title
    const project = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id: data.projects_task_id })
      .first();

    // Fetch freelancer details to get name
    const freelancer = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .first();

    // Send notification to Client that submission was received
    if (project && project.client_id && freelancer) {
      await this.notificationService.createNotification({
        user_id: project.client_id, // Client
        title: "New Submission Received",
        message: `${freelancer.first_name || 'A freelancer'} has submitted work for "${project.project_title || 'your project'}". Please review.`,
        type: "submission_received",
        related_id: submitted_project[0].submission_id,
        related_type: "submissions",
        is_read: false
      });
    }

    return submitted_project[0];
  }

  /**
   * Approve or reject a submission
   */
  public async approve(submission_id: number, status: number, data: any = {}): Promise<any> {
    if (!submission_id) {
      throw new HttpException(400, "Submission ID is required");
    }

    // Check if submission exists
    const existingSubmission = await DB(T.SUBMITTED_PROJECTS)
      .where({ submission_id, is_deleted: false })
      .first();

    if (!existingSubmission) {
      throw new HttpException(404, "Submission not found");
    }

    // Update the submission status
    const [updatedSubmission] = await DB(T.SUBMITTED_PROJECTS)
      .where({ submission_id })
      .update({
        status,
        updated_by: data.updated_by || null,
        updated_at: DB.fn.now()
      })
      .returning('*');

    // If approving the submission (status = 1), mark project and application as completed
    if (status === 1) {
      // Update project status to completed (2)
      await DB(T.PROJECTS_TASK)
        .where({ projects_task_id: existingSubmission.projects_task_id })
        .update({
          status: 2, // Completed
          completed_at: DB.fn.now(),
          updated_at: DB.fn.now()
        });

      // Update the application status to completed (2)
      await DB(T.APPLIED_PROJECTS)
        .where({
          projects_task_id: existingSubmission.projects_task_id,
          user_id: existingSubmission.user_id,
          status: 1 // Only update if it's approved
        })
        .update({
          status: 2, // Completed
          updated_at: DB.fn.now()
        });
    }

    // Fetch project details for notification
    const project = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id: existingSubmission.projects_task_id })
      .first();

    // Send notification to Freelancer
    if (status === 1) {
      // Submission approved
      await this.notificationService.createNotification({
        user_id: existingSubmission.user_id, // Freelancer
        title: "Submission Approved! ✅",
        message: `Your submission for "${project?.project_title || 'the project'}" has been approved. Great work!`,
        type: "submission_approved",
        related_id: submission_id,
        related_type: "submissions",
        is_read: false
      });
    } else if (status === 2) {
      // Submission rejected
      await this.notificationService.createNotification({
        user_id: existingSubmission.user_id, // Freelancer
        title: "Submission Needs Revision",
        message: `Your submission for "${project?.project_title || 'the project'}" requires changes. Please review feedback and resubmit.`,
        type: "submission_rejected",
        related_id: submission_id,
        related_type: "submissions",
        is_read: false
      });
    }

    return updatedSubmission;
  }

  /**
   * Get submission by ID
   */
  public async getSubmissionById(submission_id: number): Promise<any | null> {
    if (!submission_id) {
      throw new HttpException(400, "Submission ID is required");
    }

    const submission = await DB(T.SUBMITTED_PROJECTS)
      .leftJoin(T.USERS_TABLE, `${T.SUBMITTED_PROJECTS}.user_id`, `${T.USERS_TABLE}.user_id`)
      .leftJoin(T.FREELANCER_PROFILES, `${T.SUBMITTED_PROJECTS}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.PROJECTS_TASK, `${T.SUBMITTED_PROJECTS}.projects_task_id`, `${T.PROJECTS_TASK}.projects_task_id`)
      .where({
        [`${T.SUBMITTED_PROJECTS}.submission_id`]: submission_id,
        [`${T.SUBMITTED_PROJECTS}.is_deleted`]: false
      })
      .select(
        `${T.SUBMITTED_PROJECTS}.*`,
        // Freelancer info
        `${T.USERS_TABLE}.first_name as freelancer_first_name`,
        `${T.USERS_TABLE}.last_name as freelancer_last_name`,
        `${T.USERS_TABLE}.email as freelancer_email`,
        `${T.USERS_TABLE}.profile_picture as freelancer_profile_picture`,
        `${T.FREELANCER_PROFILES}.profile_title as freelancer_profile_title`,
        `${T.FREELANCER_PROFILES}.experience_level as freelancer_experience_level`,
        // Project info
        `${T.PROJECTS_TASK}.project_title`,
        `${T.PROJECTS_TASK}.client_id`,
        `${T.PROJECTS_TASK}.budget`
      )
      .first();

    return submission || null;
  }

  /**
   * Get all submissions for a specific project
   */
  public async getSubmissionsByProject(projects_task_id: number): Promise<any[]> {
    if (!projects_task_id) {
      throw new HttpException(400, "Project Task ID is required");
    }

    const submissions = await DB(T.SUBMITTED_PROJECTS)
      .leftJoin(T.USERS_TABLE, `${T.SUBMITTED_PROJECTS}.user_id`, `${T.USERS_TABLE}.user_id`)
      .leftJoin(T.FREELANCER_PROFILES, `${T.SUBMITTED_PROJECTS}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .where({
        [`${T.SUBMITTED_PROJECTS}.projects_task_id`]: projects_task_id,
        [`${T.SUBMITTED_PROJECTS}.is_deleted`]: false
      })
      .orderBy(`${T.SUBMITTED_PROJECTS}.created_at`, 'desc')
      .select(
        `${T.SUBMITTED_PROJECTS}.*`,
        // Freelancer info
        `${T.USERS_TABLE}.first_name as freelancer_first_name`,
        `${T.USERS_TABLE}.last_name as freelancer_last_name`,
        `${T.USERS_TABLE}.email as freelancer_email`,
        `${T.USERS_TABLE}.profile_picture as freelancer_profile_picture`,
        `${T.FREELANCER_PROFILES}.profile_title as freelancer_profile_title`,
        `${T.FREELANCER_PROFILES}.experience_level as freelancer_experience_level`
      );

    return submissions;
  }

  /**
   * Get all submissions by a specific freelancer
   */
  public async getSubmissionsByFreelancer(user_id: number): Promise<any[]> {
    if (!user_id) {
      throw new HttpException(400, "User ID is required");
    }

    const submissions = await DB(T.SUBMITTED_PROJECTS)
      .leftJoin(T.PROJECTS_TASK, `${T.SUBMITTED_PROJECTS}.projects_task_id`, `${T.PROJECTS_TASK}.projects_task_id`)
      .leftJoin(`${T.USERS_TABLE} as client`, `${T.PROJECTS_TASK}.client_id`, 'client.user_id')
      .leftJoin(T.CLIENT_PROFILES, `${T.PROJECTS_TASK}.client_id`, `${T.CLIENT_PROFILES}.user_id`)
      .where({
        [`${T.SUBMITTED_PROJECTS}.user_id`]: user_id,
        [`${T.SUBMITTED_PROJECTS}.is_deleted`]: false
      })
      .orderBy(`${T.SUBMITTED_PROJECTS}.created_at`, 'desc')
      .select(
        `${T.SUBMITTED_PROJECTS}.*`,
        // Project info
        `${T.PROJECTS_TASK}.project_title`,
        `${T.PROJECTS_TASK}.budget`,
        `${T.PROJECTS_TASK}.deadline`,
        `${T.PROJECTS_TASK}.status as project_status`,
        // Client info
        'client.first_name as client_first_name',
        'client.last_name as client_last_name',
        'client.email as client_email',
        `${T.CLIENT_PROFILES}.company_name as client_company_name`
      );

    return submissions;
  }

  /**
   * Get all submissions (admin only)
   */
  public async getAllSubmissions(filters: {
    status?: number;
    projects_task_id?: number;
    user_id?: number;
  } = {}): Promise<any[]> {
    let query = DB(T.SUBMITTED_PROJECTS)
      .leftJoin(T.USERS_TABLE, `${T.SUBMITTED_PROJECTS}.user_id`, `${T.USERS_TABLE}.user_id`)
      .leftJoin(T.FREELANCER_PROFILES, `${T.SUBMITTED_PROJECTS}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.PROJECTS_TASK, `${T.SUBMITTED_PROJECTS}.projects_task_id`, `${T.PROJECTS_TASK}.projects_task_id`)
      .leftJoin(`${T.USERS_TABLE} as client`, `${T.PROJECTS_TASK}.client_id`, 'client.user_id')
      .where({ [`${T.SUBMITTED_PROJECTS}.is_deleted`]: false });

    // Apply filters
    if (filters.status !== undefined) {
      query = query.where({ [`${T.SUBMITTED_PROJECTS}.status`]: filters.status });
    }
    if (filters.projects_task_id) {
      query = query.where({ [`${T.SUBMITTED_PROJECTS}.projects_task_id`]: filters.projects_task_id });
    }
    if (filters.user_id) {
      query = query.where({ [`${T.SUBMITTED_PROJECTS}.user_id`]: filters.user_id });
    }

    const submissions = await query
      .orderBy(`${T.SUBMITTED_PROJECTS}.created_at`, 'desc')
      .select(
        `${T.SUBMITTED_PROJECTS}.*`,
        // Freelancer info
        `${T.USERS_TABLE}.first_name as freelancer_first_name`,
        `${T.USERS_TABLE}.last_name as freelancer_last_name`,
        `${T.USERS_TABLE}.email as freelancer_email`,
        `${T.FREELANCER_PROFILES}.profile_title as freelancer_profile_title`,
        // Project info
        `${T.PROJECTS_TASK}.project_title`,
        `${T.PROJECTS_TASK}.budget`,
        // Client info
        'client.first_name as client_first_name',
        'client.last_name as client_last_name',
        'client.email as client_email'
      );

    return submissions;
  }
}

export default SubmissionService;
