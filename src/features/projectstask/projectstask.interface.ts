// interface.ts
export interface IProjectTask {
    projects_task_id?: number;
    user_id: number;
    project_title: string;
    project_category?: string | null;
    deadline: Date;
    project_description: string;
    budget: number;
    currency?: string;
    skills_required: any[];
    reference_links: string[];
    additional_notes: string;
    status: any;
    projects_type: string;
    project_format: string;
    audio_voiceover: string;
    video_length: number;
    preferred_video_style: string;
    project_files?: any[];
    sample_project_file: any[];
    show_all_files: any[];  
    is_active?: boolean;
    created_by: number;
    created_at?: Date;
    updated_by?: number;
    updated_at?: Date;
    is_deleted?: boolean;
    deleted_by?: number;
    deleted_at?: Date;
  }
  