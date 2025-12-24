// Base CMS Interface
export interface ICms {
    cms_id?: number;
    section_type?: string;

    // Hero Section Fields
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

    // Trusted Company Fields
    company_name?: string;
    logo_url?: string;
    website_url?: string;

    // Why Choose Us Fields
    content?: string;
    icon?: string;
    metadata?: Record<string, any>;

    // Featured Creator Fields
    name?: string;
    bio?: string;
    profile_image?: string;
    portfolio_url?: string;
    social_linkedin?: string;
    social_twitter?: string;
    social_instagram?: string;
    skills?: string[];
    stats?: Record<string, any>;

    // Success Story Fields
    client_name?: string;
    client_title?: string;
    client_image?: string;
    testimonial?: string;
    rating?: number;
    project_type?: string;
    company?: string;
    company_logo?: string;

    // Landing FAQ Fields
    category?: string;
    question?: string;
    answer?: string;
    tags?: string[];

    // Common Fields
    is_active?: boolean;
    sort_order?: number;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
    updated_by?: number;
    is_deleted?: boolean;
    deleted_by?: number;
    deleted_at?: string;
}

// Extended types from cms.types.ts
import { Request } from 'express';

export interface AuthenticatedUser {
    user_id: number;
    email: string;
    role?: string;
    permissions?: string[];
}

export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}

export interface LandingPageContent {
    hero: ICms[];
    trustedCompanies: ICms[];
    whyChooseUs: ICms[];
    featuredCreators: ICms[];
    successStories: ICms[];
    faqs: ICms[];
}

export interface ReorderResult {
    message: string;
    count: number;
    updated: number[];
}

export enum SectionType {
    HERO = 'hero',
    TRUSTED_COMPANY = 'trusted_company',
    WHY_CHOOSE_US = 'why_choose_us',
    FEATURED_CREATOR = 'featured_creator',
    SUCCESS_STORY = 'success_story',
    LANDING_FAQ = 'landing_faq',
    GENERAL = 'general'
}
