/**
 * CMS Featured Creators Interface
 * Maps to database table: cms_featured_creators
 */

/**
 * Stats object structure for featured creators
 */
export interface ICreatorStats {
    projects_completed?: number;
    rating?: number;
    years_experience?: number;
    total_earnings?: number;
    clients_served?: number;
    [key: string]: any; // Allow additional stats
}

export interface ICmsFeaturedCreators {
    // Primary Key
    id?: number;

    // Content Fields
    name: string;
    title?: string | null;
    bio?: string | null;
    profile_image: string;
    portfolio_url?: string | null;

    // Social Links
    social_linkedin?: string | null;
    social_twitter?: string | null;
    social_instagram?: string | null;

    // JSONB Fields
    skills?: string[] | null; // Array of skill names
    stats?: ICreatorStats | null; // Statistics object

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
 * DTO for creating featured creator
 */
export interface ICreateCmsFeaturedCreators {
    name: string;
    title?: string;
    bio?: string;
    profile_image: string;
    portfolio_url?: string;
    social_linkedin?: string;
    social_twitter?: string;
    social_instagram?: string;
    skills?: string[];
    stats?: ICreatorStats;
    is_active?: boolean;
    sort_order?: number;
    created_by: number;
}

/**
 * DTO for updating featured creator
 */
export interface IUpdateCmsFeaturedCreators {
    name?: string;
    title?: string;
    bio?: string;
    profile_image?: string;
    portfolio_url?: string;
    social_linkedin?: string;
    social_twitter?: string;
    social_instagram?: string;
    skills?: string[];
    stats?: ICreatorStats;
    is_active?: boolean;
    sort_order?: number;
    updated_by: number;
}
