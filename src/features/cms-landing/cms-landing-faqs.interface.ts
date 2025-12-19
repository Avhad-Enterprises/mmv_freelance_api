/**
 * CMS Landing FAQs Interface
 * Maps to database table: cms_landing_faqs
 */
export interface ICmsLandingFaqs {
    // Primary Key
    id?: number;

    // Content Fields
    category?: string;
    question: string;
    answer: string;

    // JSONB Field - Tags for filtering/searching
    tags?: string[] | null;

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
 * DTO for creating landing FAQ
 */
export interface ICreateCmsLandingFaqs {
    category?: string;
    question: string;
    answer: string;
    tags?: string[];
    is_active?: boolean;
    sort_order?: number;
    created_by: number;
}

/**
 * DTO for updating landing FAQ
 */
export interface IUpdateCmsLandingFaqs {
    category?: string;
    question?: string;
    answer?: string;
    tags?: string[];
    is_active?: boolean;
    sort_order?: number;
    updated_by: number;
}
