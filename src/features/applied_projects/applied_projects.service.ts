import { AppliedProjectsDto } from "./applied_projects.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { APPLIED_PROJECTS } from "../../../database/applied_projects.schema";

class AppliedProjectsService {

    public async apply(data: AppliedProjectsDto): Promise<any> {
        // Validate required fields
        if (!data.projects_task_id || !data.user_id) {
            throw new HttpException(400, "Project Task ID and User ID are required");
        }
        // Check if already applied
        const existing = await DB(APPLIED_PROJECTS)
            .where({
                projects_task_id: data.projects_task_id,
                user_id: data.user_id,
                is_deleted: false
            })
            .first();
        if (existing) {
            return {
                alreadyApplied: true,
                message: "Already applied to this project",
                data: existing
            };
        }
        const applicationData = {
            ...data,
            status: data.status ?? 0, // 0 = pending
            is_active: true,
            is_deleted: false,
            created_at: new Date(),
            updated_at: new Date()
        };
        const appliedProject = await DB(T.APPLIED_PROJECTS)
            .insert(applicationData)
            .returning("*");

        return {
            alreadyApplied: false,
            message: "Applied to project successfully",
            data: appliedProject[0]
        };
    }

    public async getProjectApplications(projects_task_id: number): Promise<any[]> {
        if (!projects_task_id) {
            throw new HttpException(400, "Project Task ID Required")
        }
        const projects = await DB(T.APPLIED_PROJECTS)
            .join('users', 'applied_projects.user_id', '=', 'users.user_id')
            .where({
                'applied_projects.projects_task_id': projects_task_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'users.first_name',
                'users.last_name',
                'users.profile_picture',
                'users.email',
                'users.bio'
               
            );
        return projects;
    }

    public async getUserApplications(user_id: number): Promise<any[]> {
        if (!user_id) {
            throw new HttpException(400, "User ID Required");
        }
        const applications = await DB(T.APPLIED_PROJECTS)
            .join('projects_task', 'applied_projects.projects_task_id', '=', 'projects_task.projects_task_id')
            .where({
                'applied_projects.user_id': user_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.*'
            );
        return applications;
    }

    public async getUserApplicationByProject(user_id: number, projects_task_id: number): Promise<any> {
        if (!user_id || !projects_task_id) {
            throw new HttpException(400, "User ID and Project Task ID required");
        }
        const applications = await DB(T.APPLIED_PROJECTS)
            .join('projects_task', 'applied_projects.projects_task_id', '=', 'projects_task.projects_task_id')
            .where({
                'applied_projects.user_id': user_id,
                'applied_projects.projects_task_id': projects_task_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.*'
            );
        return applications;
    }

    public async updateApplicationStatus(applied_projects_id: number, status: number): Promise<any> {
        if (!applied_projects_id) {
            throw new HttpException(400, "applied_projects_id is required");
        }
        const updated = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .update({
                status,
                updated_at: new Date()
            })
            .returning('*');
        if (!updated[0]) {
            throw new HttpException(404, "Application not found");
        }
        return updated[0];
    }

    public async withdrawApplication(applied_projects_id: number): Promise<void> {
        if (!applied_projects_id) {
            throw new HttpException(400, "applied_projects_id is required");
        }

        const application = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .first();

        if (!application) {
            throw new HttpException(404, "Application not found");
        }

        if (application.is_deleted) {
            throw new HttpException(400, "Application has already been withdrawn.");
        }

        await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .update({
                is_deleted: true,
                updated_at: new Date()
            });
    }

    public async getApplicationCountByProject(projects_task_id: number): Promise<number> {
        const result = await DB(T.APPLIED_PROJECTS)
            .where({ is_deleted: false, projects_task_id: projects_task_id })
            .count("applied_projects_id as count")
            .first();

        return Number(result?.count || 0);
    }

    public async getAppliedprojectByStatus(status: number): Promise<any[]> {
        if (![0, 1, 2, 3].includes(status)) {
            throw new HttpException(400, "Status must be 0 (pending), 1 (ongoing), 2 (completed), or 3 (rejected)");
        }

        const result = await DB(T.APPLIED_PROJECTS)
            .leftJoin('projects_task', 'applied_projects.projects_task_id', 'projects_task.projects_task_id')
            .leftJoin('users', 'applied_projects.user_id', 'users.user_id')
            .where('applied_projects.status', status)
            .andWhere('applied_projects.is_deleted', false)
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.*',
                'users.user_id',
                'users.first_name',
                'users.last_name',
                'users.profile_picture'
            );

        return result;
    }


    public async getAppliedCount(user_id: number): Promise<number> {
        if (!user_id) {
            throw new HttpException(400, "User ID is required");
        }

        const result = await DB(T.APPLIED_PROJECTS) // replace with your actual table name
            .count('* as count')
            .where({ user_id });

        const count = Number(result[0].count);

        if (isNaN(count)) {
            throw new HttpException(500, "Error converting applied count to number");
        }

        return count;
    }

    public async ongoingprojects(user_id: number): Promise<any[]> {
        return await DB(`${T.APPLIED_PROJECTS} as ap`)
            .join(`${T.PROJECTS_TASK} as pt`, 'pt.projects_task_id', 'ap.projects_task_id')
            .select(
                'ap.applied_projects_id',
                'ap.description',
                'ap.status',
                'ap.created_at as applied_at',
                'pt.project_title',
                'pt.deadline',
                'pt.budget'
            )
            .where({
                'ap.user_id': user_id,
                'ap.status': 1, // Approved
                'ap.is_deleted': false,
                'ap.is_active': true
            })
            .orderBy('ap.created_at', 'desc');
    }
    public async getprojectsbyfilter(user_id: number, filter: string): Promise<any[]> {
        const statusMap: Record<string, number> = {
            new: 0,
            ongoing: 1,
            completed: 2,
        };

        const status = statusMap[filter];

        return await DB(`${T.APPLIED_PROJECTS} as ap`)
            .join(`${T.PROJECTS_TASK} as pt`, 'pt.projects_task_id', 'ap.projects_task_id')
            .select(
                'ap.applied_projects_id',
                'ap.description as applied_description',
                'ap.status as application_status',
                'ap.created_at as applied_at',
                'pt.projects_task_id',
                'pt.project_title',
                'pt.project_category',
                'pt.deadline',
                'pt.budget',
                'pt.project_description',
                'pt.tags',
                'pt.skills_required',
                'pt.projects_type',
                'pt.project_format',
                'pt.video_length'
            )
            .where({
                'ap.user_id': user_id,
                'ap.status': status,
                'ap.is_deleted': false,
                'ap.is_active': true,
                'pt.is_deleted': false,
            })
            .orderBy('ap.created_at', 'desc');
    }
    public async getCompletedProjectCount(): Promise<number> {
        const result = await DB(T.APPLIED_PROJECTS)
            .where({
                status: 2,
                is_deleted: false
            }) // completed
            .count('applied_projects_id as count')
            .first();

        return parseInt(String(result?.count || '0'), 10);
    }


}
export default AppliedProjectsService;