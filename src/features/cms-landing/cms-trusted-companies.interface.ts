/**
 * CMS Trusted Companies Interface
 * Maps to database table: cms_trusted_companies
 */
export interface ICmsTrustedCompanies {
    // Primary Key
    id?: number;

    // Content Fields
    company_name: string;
    logo_url: string;
    website_url?: string | null;
    description?: string | null;

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
 * DTO for creating trusted company
 */
export interface ICreateCmsTrustedCompanies {
    company_name: string;
    logo_url: string;
    website_url?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
    created_by: number;
}

/**
 * DTO for updating trusted company
 */
export interface IUpdateCmsTrustedCompanies {
    company_name?: string;
    logo_url?: string;
    website_url?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
    updated_by: number;
}
