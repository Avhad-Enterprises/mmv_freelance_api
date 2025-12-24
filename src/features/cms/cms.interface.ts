// Base CMS Interface - Simplified Version 3.0.0
export interface ICms {
    cms_id?: number;
    section_type?: string;

    // Hero Section Fields (title, subtitle, background_image)
    title?: string;
    subtitle?: string;
    background_image?: string;

    // Trusted Company Fields (company_name, logo_url)
    company_name?: string;
    logo_url?: string;

    // Why Choose Us Fields (question stored in title, answer stored in description)
    description?: string;

    // Featured Creator Fields (name, bio)
    name?: string;
    bio?: string;

    // Success Story Fields (client_name, client_title, testimonial, rating)
    client_name?: string;
    client_title?: string;
    testimonial?: string;
    rating?: number;

    // Landing FAQ Fields (question, answer)
    question?: string;
    answer?: string;

    // Social Media Fields (WhatsApp, LinkedIn, Google, Instagram)
    social_whatsapp?: string;
    social_linkedin?: string;
    social_google?: string;
    social_instagram?: string;

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
    socialMedia: ICms[];
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
    SOCIAL_MEDIA = 'social_media'
}
