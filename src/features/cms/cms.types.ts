import { Request } from 'express';

// Authenticated User Interface
export interface AuthenticatedUser {
    user_id: number;
    email: string;
    role?: string;
    permissions?: string[];
}

// Extend Express Request with typed user
export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}

// Response Types
export interface CmsResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    timestamp?: string;
}

export interface PaginatedResponse<T> extends CmsResponse<T[]> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Service Return Types
export interface CmsItem {
    cms_id: number;
    section_type: string;
    title?: string;
    subtitle?: string;
    description?: string;
    content?: string;
    image?: string;
    background_image?: string;
    hero_image?: string;
    logo_url?: string;
    profile_image?: string;
    client_image?: string;
    company_logo?: string;
    icon?: string;
    company_name?: string;
    client_name?: string;
    client_title?: string;
    name?: string;
    bio?: string;
    testimonial?: string;
    question?: string;
    answer?: string;
    primary_button_text?: string;
    primary_button_link?: string;
    secondary_button_text?: string;
    secondary_button_link?: string;
    website_url?: string;
    portfolio_url?: string;
    social_linkedin?: string;
    social_twitter?: string;
    social_instagram?: string;
    category?: string;
    project_type?: string;
    company?: string;
    rating?: number;
    skills?: string[];
    stats?: Record<string, any>;
    tags?: string[];
    metadata?: Record<string, any>;
    custom_data?: Record<string, any>;
    is_active: boolean;
    sort_order: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    updated_by?: number;
    is_deleted: boolean;
    deleted_by?: number;
    deleted_at?: string;
}

export interface LandingPageContent {
    hero: CmsItem | null;
    trustedCompanies: CmsItem[];
    whyChooseUs: CmsItem[];
    featuredCreators: CmsItem[];
    successStories: CmsItem[];
    faqs: CmsItem[];
}

export interface ReorderResult {
    message: string;
    count: number;
    updated: number[];
}

// Section Types
export enum SectionType {
    HERO = 'hero',
    TRUSTED_COMPANY = 'trusted_company',
    WHY_CHOOSE_US = 'why_choose_us',
    FEATURED_CREATOR = 'featured_creator',
    SUCCESS_STORY = 'success_story',
    LANDING_FAQ = 'landing_faq',
    GENERAL = 'general'
}

// Validation Constants
export const VALIDATION_RULES = {
    URL_MAX_LENGTH: 2048,
    STRING_MAX_LENGTH: 500,
    TEXT_MAX_LENGTH: 5000,
    RATING_MIN: 1,
    RATING_MAX: 5,
    SORT_ORDER_MIN: 0,
    SORT_ORDER_MAX: 9999,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
    MAX_SKILLS_COUNT: 20,
    MAX_TAGS_COUNT: 10
} as const;
