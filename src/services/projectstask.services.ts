import { ProjectsTaskDto } from "../dtos/projectstask.dto";
import DB, { T } from "../database/index.schema";
import { IProjectTask } from '../interfaces/projectstask.interfaces';
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { PROJECTS_TASK } from "../database/projectstask.schema";
import { SubmitProjectDto } from "../dtos/submit_project.dto";
import { SUBMITTED_PROJECTS } from "../database/submitted_projects.schema";

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
    // ✅ Convert jsonb fields to JSON string
    const formattedData = {
      ...data,
      skills_required: JSON.stringify(data.skills_required),
      reference_links: JSON.stringify(data.reference_links),
      // status: JSON.stringify(data.status),
      sample_project_file: JSON.stringify(data.sample_project_file),
      project_files: JSON.stringify(data.project_files),
      show_all_files: JSON.stringify(data.show_all_files)
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

  public update = async (projects_task_id: number, updateData: any): Promise<any> => {
    try {
      // 1. check if project exists
      const project = await DB(T.PROJECTS_TASK)
        .where({ projects_task_id })
        .first();

      if (!project) {
        throw new Error('Project not found');
      }

      // 2. check if new URL is unique
      if (updateData.url) {
        const existing = await DB(T.PROJECTS_TASK)
          .where('url', updateData.url)
          .andWhereNot('projects_task_id', projects_task_id)
          .first();

        if (existing) {
          throw new Error('URL already exists. Please use a unique URL.');
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
      .leftJoin(`${T.USERS_TABLE} as editor`, `${T.PROJECTS_TASK}.editor_id`, 'editor.user_id')
      .where(`${T.PROJECTS_TASK}.is_deleted`, false)
      .orderBy(`${T.PROJECTS_TASK}.created_at`, 'desc')
      .select(
        `${T.PROJECTS_TASK}.*`,

        // Client Info
        'client.user_id as client_user_id',
        'client.first_name as client_first_name',
        'client.last_name as client_last_name',
        'client.profile_picture as client_profile_picture',

        // Editor Info
        'editor.user_id as editor_user_id',
        'editor.first_name as editor_first_name',
        'editor.last_name as editor_last_name',
        'editor.profile_picture as editor_profile_picture'
      );

    return result;
  };

  public getactivedeleted = async (): Promise<IProjectTask[]> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ is_deleted: false })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching projects');
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

  public async approve(submission_id: number, status: number, data: SubmitProjectDto): Promise<any> {
    if (!submission_id || !status) {
      throw new HttpException(400, "Submission id and Status is required");
    }

    const existing = await DB(SUBMITTED_PROJECTS)
      .where({
        submission_id: data.submission_id,
        status: data.status,
        is_deleted: false
      })
      .first();

    if (existing) {
      throw new HttpException(409, "Already Updated");
    }
    const submitData = {
      ...data,
      submission_id: submission_id,
      status: status,
      is_active: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const approved = await DB(T.SUBMITTED_PROJECTS)
      .where({ submission_id })
      .update({
        status,
        updated_at: new Date()
      })
      .returning('*');
    if (!approved || approved.length === 0) {
      throw new HttpException(404, "Submission not found");
    }
    return approved[0];
  }

  public async getTasksWithClientInfo(): Promise<any[]> {
    const result = await DB(T.PROJECTS_TASK)
      .innerJoin(T.USERS_TABLE, `${T.PROJECTS_TASK}.client_id`, '=', `${T.USERS_TABLE}.user_id`)
      .select(
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.first_name`,
        `${T.USERS_TABLE}.last_name`,
        `${T.PROJECTS_TASK}.*`
      );

    return result;
  }

  public async getTaskWithClientById(clientId: number): Promise<any[]> {
    const result = await DB(T.PROJECTS_TASK)
      .innerJoin(T.USERS_TABLE, `${T.PROJECTS_TASK}.client_id`, '=', `${T.USERS_TABLE}.user_id`)
      .select(
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.first_name`,
        `${T.USERS_TABLE}.last_name`,
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
  }

  public checkUrlInprojects = async (url: string): Promise<boolean> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ url })
        .first();

      return !!result; // true if found, false if not
    } catch (error) {
      console.error("checkUrlInprojects projects task error:", error);
      throw error;
    }
  };
  public async getBytaskId(client_id: number, is_active: number): Promise<any | null> {
    if (!client_id) {
      throw new HttpException(400, "projects_task_id is required");
    }

    const project = await DB(T.PROJECTS_TASK)
      .where({
        client_id,
        is_deleted: false,
        is_active,
      })
      .first();

    return project || null;
  }

  public async getCountByEditor(editor_id: number): Promise<number> {
    if (!editor_id) {
      throw new HttpException(400, "editor_id is required");
    }

    const result = await DB(T.PROJECTS_TASK)
      .where({
        editor_id,
        is_deleted: false
      })
      .count('* as count')
      .first();

    return Number(result?.count || 0);
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
      .where({
        is_deleted: false,
        is_active: 1
      })
      .whereNotNull("editor_id")
      .countDistinct("editor_id as count")
      .first();
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
        editor_id: user_id,
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
      .leftJoin(`${T.USERS_TABLE} as editor`, `${T.PROJECTS_TASK}.editor_id`, 'editor.user_id')
      .where(`${T.PROJECTS_TASK}.is_deleted`, false)
      .orderBy(`${T.PROJECTS_TASK}.created_at`, 'desc')
      .select(
        `${T.PROJECTS_TASK}.*`,

        // Client Info
        'client.user_id as client_user_id',
        'client.first_name as client_first_name',
        'client.last_name as client_last_name',
        'client.profile_picture as client_profile_picture',

        // Editor Info
        'editor.user_id as editor_user_id',
        'editor.first_name as editor_first_name',
        'editor.last_name as editor_last_name',
        'editor.profile_picture as editor_profile_picture'
      );

    return result;
  };


}
export default ProjectstaskService;
