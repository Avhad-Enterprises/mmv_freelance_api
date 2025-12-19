import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== HERO SECTION DTOs ====================

export class CreateHeroDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    primary_button_text?: string;

    @IsOptional()
    @IsString()
    primary_button_link?: string;

    @IsOptional()
    @IsString()
    secondary_button_text?: string;

    @IsOptional()
    @IsString()
    secondary_button_link?: string;

    @IsOptional()
    @IsString()
    background_image?: string;

    @IsOptional()
    @IsString()
    hero_image?: string;

    @IsOptional()
    @IsObject()
    custom_data?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;
}

export class UpdateHeroDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    primary_button_text?: string;

    @IsOptional()
    @IsString()
    primary_button_link?: string;

    @IsOptional()
    @IsString()
    secondary_button_text?: string;

    @IsOptional()
    @IsString()
    secondary_button_link?: string;

    @IsOptional()
    @IsString()
    background_image?: string;

    @IsOptional()
    @IsString()
    hero_image?: string;

    @IsOptional()
    @IsObject()
    custom_data?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;
}

// ==================== TRUSTED COMPANIES DTOs ====================

export class CreateTrustedCompanyDto {
    @IsString()
    company_name: string;

    @IsString()
    logo_url: string;

    @IsOptional()
    @IsString()
    website_url?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;
}

export class UpdateTrustedCompanyDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    company_name?: string;

    @IsOptional()
    @IsString()
    logo_url?: string;

    @IsOptional()
    @IsString()
    website_url?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;
}

// ==================== WHY CHOOSE US DTOs ====================

export class CreateWhyChooseUsDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;
}

export class UpdateWhyChooseUsDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;
}

// ==================== FEATURED CREATORS DTOs ====================

export class CreateFeaturedCreatorDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsString()
    profile_image: string;

    @IsOptional()
    @IsString()
    portfolio_url?: string;

    @IsOptional()
    @IsString()
    social_linkedin?: string;

    @IsOptional()
    @IsString()
    social_twitter?: string;

    @IsOptional()
    @IsString()
    social_instagram?: string;

    @IsOptional()
    @IsArray()
    skills?: string[];

    @IsOptional()
    @IsObject()
    stats?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;
}

export class UpdateFeaturedCreatorDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    profile_image?: string;

    @IsOptional()
    @IsString()
    portfolio_url?: string;

    @IsOptional()
    @IsString()
    social_linkedin?: string;

    @IsOptional()
    @IsString()
    social_twitter?: string;

    @IsOptional()
    @IsString()
    social_instagram?: string;

    @IsOptional()
    @IsArray()
    skills?: string[];

    @IsOptional()
    @IsObject()
    stats?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;
}

// ==================== SUCCESS STORIES DTOs ====================

export class CreateSuccessStoryDto {
    @IsString()
    client_name: string;

    @IsOptional()
    @IsString()
    client_title?: string;

    @IsOptional()
    @IsString()
    client_image?: string;

    @IsString()
    testimonial: string;

    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    @IsString()
    project_type?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    company_logo?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;
}

export class UpdateSuccessStoryDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    client_name?: string;

    @IsOptional()
    @IsString()
    client_title?: string;

    @IsOptional()
    @IsString()
    client_image?: string;

    @IsOptional()
    @IsString()
    testimonial?: string;

    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    @IsString()
    project_type?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    company_logo?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;
}

// ==================== LANDING FAQs DTOs ====================

export class CreateLandingFaqDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsString()
    question: string;

    @IsString()
    answer: string;

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;
}

export class UpdateLandingFaqDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    question?: string;

    @IsOptional()
    @IsString()
    answer?: string;

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    sort_order?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;
}

// ==================== REORDER DTOs ====================

export class ReorderItemDto {
    @IsNumber()
    id: number;

    @IsNumber()
    sort_order: number;
}

export class BulkReorderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items: ReorderItemDto[];
}

// ==================== DELETE DTOs ====================

export class DeleteItemDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsNumber()
    deleted_by?: number;
}
