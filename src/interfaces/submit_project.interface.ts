export interface ISubmittedProjects{
    submission_id : number;
    projects_task_id : number;
    user_id : number;
    submitted_files : string;
    additional_notes : string;
    status : number;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}