/**
 * CMS Hero Section Interface
 * Maps to database table: cms_hero
 */
export interface ICmsHero {
    // Primary Key
    id?: number;

    // Content Fields
    title: string;
    subtitle?: string | null;
    description?: string | null;
    primary_button_text?: string | null;
    primary_button_link?: string | null;
    secondary_button_text?: string | null;
    secondary_button_link?: string | null;
    background_image?: string | null;
    hero_image?: string | null;

    // JSONB Field - Flexible additional data
    custom_data?: Record<string, any> | null;

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
 * DTO for creating hero section
 */
export interface ICreateCmsHero {
    title: string;
    subtitle?: string;
    description?: string;
    primary_button_text?: string;
    primary_button_link?: string;
    secondary_button_text?: string;
    secondary_button_link?: string;
    background_image?: string;
    hero_image?: string;
    custom_data?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
    created_by: number;
}

/**
 * DTO for updating hero section
 */
export interface IUpdateCmsHero {
    title?: string;
    subtitle?: string;
    description?: string;
    primary_button_text?: string;
    primary_button_link?: string;
    secondary_button_text?: string;
    secondary_button_link?: string;
    background_image?: string;
    hero_image?: string;
    custom_data?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
    updated_by: number;
}
