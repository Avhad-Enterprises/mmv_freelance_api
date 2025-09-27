export interface ISkills {
  skill_id?: number; // Optional, as it's auto-incremented by DB
  skill_name: string;
  is_active?: number; // 0 = inactive, 1 = active
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: number;
  
  is_deleted?: boolean;
  deleted_by?: number;
  deleted_at?: Date;
}
