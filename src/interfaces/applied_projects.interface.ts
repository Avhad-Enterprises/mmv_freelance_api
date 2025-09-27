export interface IAppliedProjects {
    applied_projects_id: number;
    projects_task_id: number;
    user_id: number;
    status: number;
    description?: string;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}
  