/**
 * CMS Why Choose Us Interface
 * Maps to database table: cms_why_choose_us
 */
export interface ICmsWhyChooseUs {
    // Primary Key
    id?: number;

    // Content Fields
    title: string;
    content: string;
    icon?: string | null;

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
 * DTO for creating why choose us item
 */
export interface ICreateCmsWhyChooseUs {
    title: string;
    content: string;
    icon?: string;
    metadata?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
    created_by: number;
}

/**
 * DTO for updating why choose us item
 */
export interface IUpdateCmsWhyChooseUs {
    title?: string;
    content?: string;
    icon?: string;
    metadata?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
    updated_by: number;
}
