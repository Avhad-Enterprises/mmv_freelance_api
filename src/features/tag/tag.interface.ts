export interface TagInterface {
    tag_id?: number;
    tag_name: string;
    tag_value: string;
    tag_type: string;
    is_active?: boolean;
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
    updated_by?: number;
    is_deleted?: boolean;
    deleted_by?: number;
    deleted_at?: Date;
}

export interface CreateTagInterface {
    tag_name: string;
    tag_value: string;
    tag_type: string;
    created_by: number;
}

export interface UpdateTagInterface {
    tag_name?: string;
    tag_value?: string;
    tag_type?: string;
    updated_by: number;
}