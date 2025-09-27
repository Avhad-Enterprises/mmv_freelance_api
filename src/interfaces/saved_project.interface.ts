export interface SavedProjects {
  saved_projects_id?: number; // auto-incremented

  projects_task_id: number;
  user_id: number;

  is_active?: boolean;
  is_deleted?: boolean;

  deleted_by?: number;
  deleted_at?: Date;

  created_by?: number;
  updated_by?: number;

  created_at?: Date;
  updated_at?: Date;
}