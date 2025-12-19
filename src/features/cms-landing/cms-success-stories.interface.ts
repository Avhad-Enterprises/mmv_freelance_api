/**
 * CMS Success Stories / Testimonials Interface
 * Maps to database table: cms_success_stories
 */
export interface ICmsSuccessStories {
    // Primary Key
    id?: number;

    // Content Fields
    client_name: string;
    client_title?: string | null;
    client_image?: string | null;
    testimonial: string;
    rating?: number | null; // 1-5 star rating
    project_type?: string | null;
    company?: string | null;
    company_logo?: string | null;

    // JSONB Field - Flexible additional data
    metadata?: Record<string, any> | null;

    // Visibility & Ordering
    is_active?: boolean;
    sort_order?: number;

    // Audit Fields
    created_by: number;
    created_at?: string | Date;
    updated_at?: string | Date;
    updated_by?: number | null;

    // Soft Delete
    is_deleted?: boolean;
    deleted_by?: number | null;
    deleted_at?: string | Date | null;
}

/**
 * DTO for creating success story
 */
export interface ICreateCmsSuccessStories {
    client_name: string;
    client_title?: string;
    client_image?: string;
    testimonial: string;
    rating?: number; // 1-5
    project_type?: string;
    company?: string;
    company_logo?: string;
    metadata?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
    created_by: number;
}

/**
 * DTO for updating success story
 */
export interface IUpdateCmsSuccessStories {
    client_name?: string;
    client_title?: string;
    client_image?: string;
    testimonial?: string;
    rating?: number; // 1-5
    project_type?: string;
    company?: string;
    company_logo?: string;
    metadata?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
    updated_by: number;
}
