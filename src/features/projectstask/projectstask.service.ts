import { ProjectsTaskDto } from "./projectstask.dto";
import DB, { T } from "../../../database/index";
import { IProjectTask } from './projectstask.interface';
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { PROJECTS_TASK } from "../../../database/projectstask.schema";
import { SubmitProjectDto } from "./submit-project.dto";
import { SUBMITTED_PROJECTS } from "../../../database/submitted_projects.schema";

class ProjectstaskService {
  public async Insert(data: ProjectsTaskDto): Promise<IProjectTask> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Project data is empty");
    }

    // Check if URL already exists
    const existingUser = await DB(T.PROJECTS_TASK)
      .where({ url: data.url })
      .first();

    if (existingUser) {
      throw new HttpException(409, "URL already registered");
    }
    // ✅ Convert jsonb fields to JSON string for database insertion
    const formattedData = {
      ...data,
      skills_required: JSON.stringify(data.skills_required),
      reference_links: JSON.stringify(data.reference_links),
      sample_project_file: JSON.stringify(data.sample_project_file || []),
      project_files: JSON.stringify(data.project_files || []),
      show_all_files: JSON.stringify(data.show_all_files || [])
    };

    // ✅ Insert into correct table: projects_task
    const [createdUser] = await DB(T.PROJECTS_TASK)
      .insert(formattedData)
      .returning("*");

    return createdUser;
  }

  public async getById(projects_task_id: number): Promise<any | null> {
    if (!projects_task_id) {
      throw new HttpException(400, "projects Task ID is required");
    }
    const projects = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id, is_deleted: false })
      .first();
    return projects || null;
  }

  /**
   * Get project by ID with optional includes
   */
  public async getProjectById(projects_task_id: number, options: { include?: string } = {}): Promise<any | null> {
    if (!projects_task_id) {
      throw new HttpException(400, "Project Task ID is required");
    }

    if (options.include === 'client') {
      // Get project with client info
      return await this.getTaskWithClientById(projects_task_id);
    } else {
      // Default: get project without client info
      return await this.getById(projects_task_id);
    }
  }

  public update = async (projects_task_id: number, updateData: any): Promise<any> => {
    try {
      // 1. check if project exists
      const project = await DB(T.PROJECTS_TASK)
        .where({ projects_task_id })
        .first();

      if (!project) {
        throw new HttpException(404, 'Project not found');
      }

      // 2. check if new URL is unique
      if (updateData.url) {
        const existing = await DB(T.PROJECTS_TASK)
          .where('url', updateData.url)
          .andWhereNot('projects_task_id', projects_task_id)
          .first();

        if (existing) {
          throw new HttpException(409, 'URL already exists. Please use a unique URL.');
        }
      }

      // 3. update project
      await DB(T.PROJECTS_TASK)
        .where({ projects_task_id })
        .update({
          ...updateData,
          updated_at: new Date()
        });

      // 4. return updated project
      const updatedProjecttask = await DB(T.PROJECTS_TASK)
        .where({ projects_task_id })
        .first();

      return updatedProjecttask;

    } catch (error) {
      console.error("Service error:", error);
      throw error;
    }
  };

  public async softDelete(projects_task_id: number, data: Partial<any>): Promise<any> {
    // Check if project exists
    const project = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id })
      .first();

    if (!project) {
      throw new HttpException(404, 'Project not found');
    }

    const deleted_at = new Date();

    const result = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id })
      .update({
        ...data,
        deleted_at,
      })
      .returning('*');

    return result[0];
  }

  public async projectstaskActive(): Promise<number> {
    const count = await DB(T.PROJECTS_TASK)
      .where({ is_active: 1, is_deleted: false })
      .count("projects_task_id as count");

    return Number(count[0].count);
  }

  public async countprojectstask(): Promise<number> {
    const result = await DB(T.PROJECTS_TASK)
      .whereNotNull('deadline')
      .count('projects_task_id as count');
    return Number(result[0].count);
  }


  public getAllProjectsTask = async (): Promise<any[]> => {
    const result = await DB(T.PROJECTS_TASK)
      .leftJoin(`${T.USERS_TABLE} as client`, `${T.PROJECTS_TASK}.client_id`, 'client.user_id')
      .leftJoin(T.CLIENT_PROFILES, `${T.PROJECTS_TASK}.client_id`, `${T.CLIENT_PROFILES}.user_id`)
      .leftJoin(`${T.USERS_TABLE} as editor`, `${T.PROJECTS_TASK}.freelancer_id`, 'editor.user_id')
      .leftJoin(T.FREELANCER_PROFILES, `${T.PROJECTS_TASK}.freelancer_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .where(`${T.PROJECTS_TASK}.is_deleted`, false)
      .orderBy(`${T.PROJECTS_TASK}.created_at`, 'desc')
      .select(
        `${T.PROJECTS_TASK}.*`,

        // Client Info
        'client.user_id as client_user_id',
        'client.first_name as client_first_name',
        'client.last_name as client_last_name',
        'client.profile_picture as client_profile_picture',
        `${T.CLIENT_PROFILES}.company_name as client_company_name`,
        `${T.CLIENT_PROFILES}.industry as client_industry`,

        // Editor Info
        'editor.user_id as editor_user_id',
        'editor.first_name as editor_first_name',
        'editor.last_name as editor_last_name',
        'editor.profile_picture as editor_profile_picture',
        `${T.FREELANCER_PROFILES}.profile_title as editor_profile_title`,
        `${T.FREELANCER_PROFILES}.experience_level as editor_experience_level`
      );

    return result;
  };

  /**
   * Get projects with various filtering options
   */
  public async getProjects(filters: {
    status?: string;
    include?: string;
    client_id?: string | number;
    url?: string;
    is_active?: string | number;
  } = {}): Promise<any[]> {
    const { status, include, client_id, url, is_active } = filters;

    // Handle different query parameters
    if (status === 'deleted') {
      // Get only deleted projects
      return await this.getDeletedprojectstask();
    } else if (status === 'active') {
      // Get only active (non-deleted) projects
      return await this.getactivedeleted();
    } else if (include === 'client') {
      // Get all projects with client info
      return await this.getTasksWithClientInfo();
    } else if (client_id) {
      // Filter by client_id
      const idNum = typeof client_id === 'string' ? parseInt(client_id, 10) : client_id;
      if (isNaN(idNum)) {
        throw new HttpException(400, "client_id must be a number");
      }
      return await this.getProjectsByClient(idNum);
    } else if (url) {
      // Filter by URL
      const project = await this.getByUrl(url);
      return project ? [project] : [];
    } else if (is_active !== undefined) {
      // Filter by is_active status
      const activeStatus = typeof is_active === 'string' ? parseInt(is_active, 10) : is_active;
      if (isNaN(activeStatus) || (activeStatus !== 0 && activeStatus !== 1)) {
        throw new HttpException(400, "is_active must be 0 or 1");
      }
      return await this.getProjectsByActiveStatus(activeStatus);
    } else {
      // Default: get all projects
      return await this.getAllProjectsTask();
    }
  }

  public getDeletedprojectstask = async (): Promise<IProjectTask[]> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ is_deleted: true })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching projects Task');
    }
  }

  public getactivedeleted = async (): Promise<IProjectTask[]> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ is_deleted: false })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching active projects');
    }
  }

  public async submit(data: SubmitProjectDto): Promise<any> {

    if (!data.projects_task_id || !data.user_id) {
      throw new HttpException(400, "Project Task ID and User ID are required");
    }

    const existing = await DB(SUBMITTED_PROJECTS)
      .where({
        projects_task_id: data.projects_task_id,
        user_id: data.user_id,
        is_deleted: false
      })
      .first();

    if (existing) {
      throw new HttpException(409, "Already Submitted");
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

    return submitted_project[0];
  }

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

    return updatedSubmission;
  }

  public async getTasksWithClientInfo(): Promise<any[]> {
    const result = await DB(T.PROJECTS_TASK)
      .innerJoin(T.USERS_TABLE, `${T.PROJECTS_TASK}.client_id`, '=', `${T.USERS_TABLE}.user_id`)
      .leftJoin(T.CLIENT_PROFILES, `${T.PROJECTS_TASK}.client_id`, `${T.CLIENT_PROFILES}.user_id`)
      .select(
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.first_name`,
        `${T.USERS_TABLE}.last_name`,
        `${T.CLIENT_PROFILES}.company_name`,
        `${T.CLIENT_PROFILES}.industry`,
        `${T.PROJECTS_TASK}.*`
      );

    return result;
  }

  public async getTaskWithClientById(clientId: number): Promise<any[]> {
    const result = await DB(T.PROJECTS_TASK)
      .innerJoin(T.USERS_TABLE, `${T.PROJECTS_TASK}.client_id`, '=', `${T.USERS_TABLE}.user_id`)
      .leftJoin(T.CLIENT_PROFILES, `${T.PROJECTS_TASK}.client_id`, `${T.CLIENT_PROFILES}.user_id`)
      .select(
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.first_name`,
        `${T.USERS_TABLE}.last_name`,
        `${T.CLIENT_PROFILES}.company_name`,
        `${T.CLIENT_PROFILES}.industry`,
        `${T.PROJECTS_TASK}.*`
      )
      .where(`${T.PROJECTS_TASK}.client_id`, clientId)
      .andWhere(`${T.PROJECTS_TASK}.is_deleted`, false)
      .orderBy(`${T.PROJECTS_TASK}.created_at`, 'desc');

    return result;
  }

  public async getByUrl(url: string): Promise<IProjectTask | null> {
    const projectstask = await DB(T.PROJECTS_TASK)
      .where({ url })
      .first();

    return projectstask;
  };

  public async getProjectsByClient(client_id: number): Promise<any[]> {
    if (!client_id) {
      throw new HttpException(400, "client_id is required");
    }

    const projects = await DB(T.PROJECTS_TASK)
      .where({
        client_id,
        is_deleted: false
      })
      .orderBy('created_at', 'desc')
      .select('*');

    return projects;
  }

  public async getProjectsByActiveStatus(is_active: number): Promise<any[]> {
    if (is_active !== 0 && is_active !== 1) {
      throw new HttpException(400, "is_active must be 0 or 1");
    }

    const projects = await DB(T.PROJECTS_TASK)
      .where({
        is_active,
        is_deleted: false
      })
      .orderBy('created_at', 'desc')
      .select('*');

    return projects;
  }

  /**
   * Get project counts with various filtering options
   */
  public async getProjectCounts(filters: {
    type?: string;
    client_id?: string | number;
    freelancer_id?: string | number;
  } = {}): Promise<any> {
    const { type, client_id, freelancer_id } = filters;

    if (client_id) {
      // Count projects for specific client
      const countResult = await DB(T.PROJECTS_TASK)
        .where({
          client_id: typeof client_id === 'string' ? parseInt(client_id) : client_id,
          is_deleted: false
        })
        .count('projects_task_id as count')
        .first();

      return {
        success: true,
        client_id: typeof client_id === 'string' ? parseInt(client_id) : client_id,
        projects_count: parseInt(countResult?.count as string) || 0
      };
    }

    if (freelancer_id) {
      // For freelancer counts, we need to check assigned projects
      // This is a placeholder - adjust based on your assignment logic
      return {
        success: true,
        freelancer_id: typeof freelancer_id === 'string' ? parseInt(freelancer_id) : freelancer_id,
        shortlisted_count: 0
      };
    }

    // General project counts by type
    let query = DB(T.PROJECTS_TASK).where({ is_deleted: false });

    switch (type) {
      case 'active':
        query = query.where({ status: 0 }); // Assuming 0 is active/pending
        break;
      case 'completed':
        query = query.where({ status: 2 }); // Assuming 2 is completed
        break;
      case 'all':
      default:
        // No additional filter for 'all'
        break;
    }

    const countResult = await query.count('projects_task_id as count').first();

    return {
      count: parseInt(countResult?.count as string) || 0,
      type: type || 'all'
    };
  }

  public async getCountByClient(client_id: number): Promise<number> {
    if (!client_id) {
      throw new HttpException(400, "client_id is required");
    }

    const result = await DB(T.PROJECTS_TASK)
      .where({
        client_id,
        is_deleted: false
      })
      .count('* as count')
      .first();

    return Number(result?.count || 0);
  }

  public async getCountByFreelancer(freelancer_id: number): Promise<number> {
    if (!freelancer_id) {
      throw new HttpException(400, "freelancer_id is required");
    }

    const result = await DB(T.PROJECTS_TASK)
      .where({
        freelancer_id,
        is_deleted: false
      })
      .count('* as count')
      .first();

    return Number(result?.count || 0);
  }
  public async getActiveclientsCount(): Promise<number> {
    const result = await DB(T.PROJECTS_TASK)
      .where({
        is_deleted: false,
        is_active: 1
      })
      .whereNotNull("client_id")
      .countDistinct("client_id as count")
      .first();

    return Number(result?.count || 0);
  }
  public async getActiveEditorsCount(): Promise<any> {
    const result = await DB(T.PROJECTS_TASK)
      .join(T.VIDEOEDITOR_PROFILES, `${T.PROJECTS_TASK}.freelancer_id`, `${T.VIDEOEDITOR_PROFILES}.freelancer_id`)
      .where({
        [`${T.PROJECTS_TASK}.is_deleted`]: false,
        [`${T.PROJECTS_TASK}.is_active`]: 1
      })
      .whereNotNull(`${T.PROJECTS_TASK}.freelancer_id`)
      .countDistinct(`${T.VIDEOEDITOR_PROFILES}.editor_id as count`)
      .first();

    return Number(result?.count || 0);
  }

  public async getCompletedProjectCount(): Promise<number> {
    const result = await DB(PROJECTS_TASK)
      .where({ is_active: 1, is_deleted: false })
      .count('projects_task_id as count')
      .first();

    return Number(result?.count || 0);
  }

  public async updateProjectTaskStatus(projects_task_id: number, status: number, user_id?: number): Promise<any> {

    if (!projects_task_id) {
      throw new HttpException(400, "projects_task_id is required");
    }

    const updated = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id })
      .update({
        status,
        freelancer_id: user_id,
        updated_at: new Date()
      })
      .returning("*");

    if (!updated[0]) {
      throw new HttpException(404, "Project not found");
    }

    return updated[0];
  }

  public getAllProjectslisting = async (): Promise<any[]> => {
    const result = await DB(T.PROJECTS_TASK)
      .leftJoin(`${T.USERS_TABLE} as client`, `${T.PROJECTS_TASK}.client_id`, 'client.user_id')
      .leftJoin(T.CLIENT_PROFILES, `${T.PROJECTS_TASK}.client_id`, `${T.CLIENT_PROFILES}.client_id`)
      .leftJoin(`${T.USERS_TABLE} as freelancer`, `${T.PROJECTS_TASK}.freelancer_id`, 'freelancer.user_id')
      .leftJoin(T.FREELANCER_PROFILES, `${T.PROJECTS_TASK}.freelancer_id`, `${T.FREELANCER_PROFILES}.freelancer_id`)
      .where(`${T.PROJECTS_TASK}.is_deleted`, false)
      .where(`${T.PROJECTS_TASK}.status`, 0) // Only show active/pending jobs (not assigned or completed)
      .orderBy(`${T.PROJECTS_TASK}.created_at`, 'desc')
      .select(
        `${T.PROJECTS_TASK}.*`,

        // Client Info
        'client.user_id as client_user_id',
        'client.first_name as client_first_name',
        'client.last_name as client_last_name',
        'client.profile_picture as client_profile_picture',
        `${T.CLIENT_PROFILES}.company_name as client_company_name`,
        `${T.CLIENT_PROFILES}.industry as client_industry`,

        // Freelancer Info
        'freelancer.user_id as freelancer_user_id',
        'freelancer.first_name as freelancer_first_name',
        'freelancer.last_name as freelancer_last_name',
        'freelancer.profile_picture as freelancer_profile_picture',
        `${T.FREELANCER_PROFILES}.profile_title as freelancer_profile_title`,
        `${T.FREELANCER_PROFILES}.experience_level as freelancer_experience_level`
      );

    return result;
  };

}
export default ProjectstaskService;
