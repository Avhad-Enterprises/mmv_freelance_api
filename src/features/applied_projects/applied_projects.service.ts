import { AppliedProjectsDto } from "./applied_projects.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { CreditsService } from "../credits/services";
import { CreditLoggerService } from "../credits/services/credit-logger.service";
import NotificationService from "../notification/notification.service";

/**
 * Applied Projects Service
 * 
 * Handles job applications from freelancers to client projects.
 * 
 * WORKFLOW:
 * 1. Freelancer applies → Application Status = 0 (Pending)
 * 2. Client approves → Application Status = 1 (Approved)
 *                    → Project Task Status = 1 (Assigned/In Progress)
 *                    → project.freelancer_id is set
 * 3. Freelancer submits work → Submission created
 * 4. Client approves submission → Application Status = 2 (Completed)
 *                               → Project Task Status = 2 (Completed)
 * 
 * STATUS CODES:
 * - 0: Pending (waiting for client review)
 * - 1: Approved (freelancer hired, project in progress)
 * - 2: Completed (project finished)
 * - 3: Rejected (client rejected application)
 */

class AppliedProjectsService {
    private creditsService = new CreditsService();
    private creditLogger = new CreditLoggerService();
    private notificationService = new NotificationService();

    /**
     * Apply to a project with atomic transaction
     * SECURITY: Credits and application are in same transaction
     * If application insert fails, credits are automatically rolled back
     */
    public async apply(data: AppliedProjectsDto): Promise<any> {
        // Validate required fields
        if (!data.projects_task_id || !data.user_id) {
            throw new HttpException(400, "Project Task ID and User ID are required");
        }

        // Check if already applied (outside transaction for performance)
        const existing = await DB(T.APPLIED_PROJECTS)
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

        const CREDITS_PER_APPLICATION = 1;

        // Check project exists and get details (outside transaction)
        const project = await DB(T.PROJECTS_TASK)
            .join(T.CLIENT_PROFILES, `${T.PROJECTS_TASK}.client_id`, '=', `${T.CLIENT_PROFILES}.client_id`)
            .where({
                [`${T.PROJECTS_TASK}.projects_task_id`]: data.projects_task_id,
                [`${T.PROJECTS_TASK}.is_deleted`]: false
            })
            .select(
                `${T.PROJECTS_TASK}.bidding_enabled`,
                `${T.CLIENT_PROFILES}.user_id`,
                `${T.PROJECTS_TASK}.project_title`
            )
            .first();

        if (!project) {
            throw new HttpException(404, "Project not found");
        }

        if (project.bidding_enabled) {
            if (!data.bid_amount || data.bid_amount <= 0) {
                throw new HttpException(400, "Bid amount is required and must be greater than 0 for projects with bidding enabled");
            }
        }

        // ATOMIC TRANSACTION: Credits + Application together
        // If any step fails, everything is rolled back
        const result = await DB.transaction(async (trx) => {
            // Step 1: Lock and check credits with row-level lock
            const profile = await trx(T.FREELANCER_PROFILES)
                .where({ user_id: data.user_id })
                .select('credits_balance', 'credits_used')
                .forUpdate() // Row-level lock prevents race condition
                .first();

            if (!profile) {
                throw new HttpException(404, "Freelancer profile not found");
            }

            if (profile.credits_balance < CREDITS_PER_APPLICATION) {
                throw new HttpException(400, {
                    code: 'INSUFFICIENT_CREDITS',
                    message: 'Insufficient credits. Please purchase more credits to apply.',
                    required: CREDITS_PER_APPLICATION,
                    available: profile.credits_balance,
                    purchaseUrl: '/api/v1/credits/packages'
                });
            }

            // Step 2: Deduct credits
            await trx(T.FREELANCER_PROFILES)
                .where({ user_id: data.user_id })
                .update({
                    credits_balance: profile.credits_balance - CREDITS_PER_APPLICATION,
                    credits_used: profile.credits_used + CREDITS_PER_APPLICATION,
                    updated_at: trx.fn.now()
                });

            // Step 3: Create application (if this fails, credits are rolled back)
            const applicationData = {
                ...data,
                credits_spent: CREDITS_PER_APPLICATION,
                status: data.status ?? 0, // 0 = pending
                is_active: true,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date()
            };

            const [appliedProject] = await trx(T.APPLIED_PROJECTS)
                .insert(applicationData)
                .returning("*");

            // Step 4: Log the credit transaction for history tracking
            await this.creditLogger.log({
                user_id: data.user_id,
                transaction_type: 'deduction',
                amount: -CREDITS_PER_APPLICATION,
                balance_before: profile.credits_balance,
                balance_after: profile.credits_balance - CREDITS_PER_APPLICATION,
                reference_type: 'application',
                reference_id: appliedProject.applied_projects_id,
                description: `Applied to project: ${project.project_title || `#${data.projects_task_id}`}`
            }, trx);

            return {
                application: appliedProject,
                creditsDeducted: CREDITS_PER_APPLICATION,
                newBalance: profile.credits_balance - CREDITS_PER_APPLICATION
            };
        });

        // Send Notification (outside transaction - non-critical)
        try {
            if (project.user_id) {
                await this.notificationService.createNotification({
                    user_id: project.user_id,
                    title: "New Proposal Received",
                    message: `A freelancer has applied to your project: ${project.project_title || 'Untitled Project'}`,
                    type: "proposal",
                    related_id: result.application.applied_projects_id,
                    related_type: "applied_projects",
                    is_read: false
                });
            }
        } catch (notificationError) {
            // Log but don't fail - notification is not critical
            console.error('Failed to send notification:', notificationError);
        }

        return {
            alreadyApplied: false,
            message: "Applied to project successfully",
            data: result.application,
            credits_deducted: result.creditsDeducted,
            new_balance: result.newBalance
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
            .leftJoin(`${T.USERS_TABLE} as client`, 'projects_task.client_id', 'client.user_id')
            .leftJoin(T.CLIENT_PROFILES, 'projects_task.client_id', `${T.CLIENT_PROFILES}.user_id`)
            .leftJoin(T.SUBMITTED_PROJECTS, function () {
                this.on('projects_task.projects_task_id', '=', `${T.SUBMITTED_PROJECTS}.projects_task_id`)
                    .andOn('applied_projects.user_id', '=', `${T.SUBMITTED_PROJECTS}.user_id`)
                    .andOn(`${T.SUBMITTED_PROJECTS}.is_deleted`, '=', DB.raw('false'));
            })
            .where({
                'applied_projects.user_id': user_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.*',
                // Client information
                'client.user_id as client_user_id',
                'client.first_name as client_first_name',
                'client.last_name as client_last_name',
                'client.profile_picture as client_profile_picture',
                `${T.CLIENT_PROFILES}.company_name as client_company_name`,
                `${T.CLIENT_PROFILES}.industry as client_industry`,
                // Submission information
                `${T.SUBMITTED_PROJECTS}.submission_id`,
                `${T.SUBMITTED_PROJECTS}.status as submission_status`,
                `${T.SUBMITTED_PROJECTS}.submitted_files`,
                `${T.SUBMITTED_PROJECTS}.additional_notes as submission_notes`,
                `${T.SUBMITTED_PROJECTS}.created_at as submitted_at`
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

        // Get the application first to get project and user details
        const application = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .first();

        if (!application) {
            throw new HttpException(404, "Application not found");
        }

        // Update the application status
        const updated = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .update({
                status,
                updated_at: new Date()
            })
            .returning('*');

        // If approving the application (status=1), assign the freelancer to the project
        if (status === 1) {
            // Get freelancer profile to get freelancer_id
            const freelancerProfile = await DB(T.FREELANCER_PROFILES)
                .where({ user_id: application.user_id })
                .first();

            if (freelancerProfile) {
                // Update the project to assign the freelancer and set status to assigned
                await DB(T.PROJECTS_TASK)
                    .where({ projects_task_id: application.projects_task_id })
                    .update({
                        freelancer_id: freelancerProfile.freelancer_id,
                        status: 1, // assigned
                        assigned_at: new Date(),
                        updated_at: new Date()
                    });
            }
        }

        // NOTIFICATION LOGIC
        if (status === 1) { // Accepted/Hired
            await this.notificationService.createNotification({
                user_id: application.user_id, // The Freelancer
                title: "Proposal Accepted!",
                message: `Congratulations! You have been hired for the project.`,
                type: "hired",
                related_id: application.projects_task_id,
                related_type: "projects_task",
                is_read: false
            });
        } else if (status === 3) { // Rejected
            await this.notificationService.createNotification({
                user_id: application.user_id, // The Freelancer
                title: "Proposal Update",
                message: `Your proposal for the project was not selected.`,
                type: "rejected",
                related_id: application.projects_task_id,
                related_type: "projects_task",
                is_read: false
            });
        }

        return updated[0];
    }

    /**
     * Withdraw application
     * SECURITY: Verifies user owns the application
     * NOTE: Credits are not refunded when withdrawing applications
     */
    public async withdrawApplication(
        applied_projects_id: number,
        user_id: number
    ): Promise<{ message: string }> {
        if (!applied_projects_id) {
            throw new HttpException(400, "applied_projects_id is required");
        }

        const application = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .first();

        if (!application) {
            throw new HttpException(404, "Application not found");
        }

        // SECURITY: Verify user owns this application
        if (application.user_id !== user_id) {
            throw new HttpException(403, "You can only withdraw your own applications");
        }

        if (application.is_deleted) {
            throw new HttpException(400, "Application has already been withdrawn.");
        }

        // Check if application is already approved (status = 1)
        if (application.status === 1) {
            throw new HttpException(400, "Cannot withdraw from an approved project. Please contact support if you have concerns.");
        }

        await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .update({
                is_deleted: true,
                is_active: false,
                deleted_at: new Date(),
                deleted_by: user_id,
                updated_at: new Date()
            });

        // Fetch project details to get client_id and project_title
        const project = await DB(T.PROJECTS_TASK)
            .where({ projects_task_id: application.projects_task_id })
            .first();

        // Fetch freelancer details to get name
        const freelancer = await DB(T.USERS_TABLE)
            .where({ user_id: application.user_id })
            .first();

        // Send notification to Client that application was withdrawn
        if (project && project.client_id && freelancer) {
            await this.notificationService.createNotification({
                user_id: project.client_id, // Client
                title: "Application Withdrawn",
                message: `${freelancer.first_name} ${freelancer.last_name} has withdrawn their application for "${project.project_title || 'your project'}".`,
                type: "application_withdrawn",
                related_id: application.projects_task_id,
                related_type: "projects_task",
                is_read: false
            });
        }

        return { message: "Application withdrawn successfully" };
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