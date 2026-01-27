export interface CareerInterface {
    job_id?: number;
    title: string;
    short_description: string;
    office_location: string;
    detail_description: string;
    job_details: string;
    apply_link: string;
    company_logo?: string;
    is_active?: boolean;
    created_by?: number;
    created_at?: Date;
    updated_at?: Date;
    updated_by?: number;
    is_deleted?: boolean;
    deleted_by?: number;
    deleted_at?: Date;
}

export interface CreateCareerInterface {
    title: string;
    short_description: string;
    office_location: string;
    detail_description?: string;
    job_details?: string;
    apply_link: string;
    company_logo?: string;
    created_by?: number;
    is_active?: boolean;
}

export interface UpdateCareerInterface {
    title?: string;
    short_description?: string;
    office_location?: string;
    detail_description?: string;
    job_details?: string;
    apply_link?: string;
    company_logo?: string;
    updated_by?: number;
    is_active?: boolean;
}
