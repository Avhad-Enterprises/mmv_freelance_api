export interface SkillInterface {
    skill_id?: number;
    skill_name: string;
    is_active?: boolean;
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
    updated_by?: number;
    is_deleted?: boolean;
    deleted_by?: number;
    deleted_at?: Date;
}

export interface CreateSkillInterface {
    skill_name: string;
    created_by: number;
}

export interface UpdateSkillInterface {
    skill_name?: string;
    updated_by: number;
}