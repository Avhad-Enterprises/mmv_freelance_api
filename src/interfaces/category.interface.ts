export interface IProjectCategory {
    category_id?: number;
    category_name: string;
    category_value: string;
    category_slug: string;  
    is_active?: boolean;
    created_by: number;
    created_at?: Date;
    updated_by?: number;
    updated_at?: Date;
    is_deleted?: boolean;
    deleted_by?: number;
    deleted_at?: Date;
  }
  