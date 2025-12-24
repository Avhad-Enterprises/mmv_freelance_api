import { 
    IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, 
    IsObject, IsUrl, MaxLength, MinLength, Min, Max, IsInt, IsNotEmpty, Matches, IsEmail
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== HERO SECTION DTOs ====================

export class CreateHeroDto {
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title: string;

    @IsOptional()
    @IsString({ message: 'Subtitle must be a string' })
    @MaxLength(500, { message: 'Subtitle cannot exceed 500 characters' })
    subtitle?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Primary button text must be a string' })
    @MaxLength(100, { message: 'Primary button text cannot exceed 100 characters' })
    primary_button_text?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Primary button link must be a valid URL' })
    @MaxLength(2048, { message: 'Primary button link cannot exceed 2048 characters' })
    primary_button_link?: string;

    @IsOptional()
    @IsString({ message: 'Secondary button text must be a string' })
    @MaxLength(100, { message: 'Secondary button text cannot exceed 100 characters' })
    secondary_button_text?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Secondary button link must be a valid URL' })
    @MaxLength(2048, { message: 'Secondary button link cannot exceed 2048 characters' })
    secondary_button_link?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Background image must be a valid URL' })
    @MaxLength(2048, { message: 'Background image URL cannot exceed 2048 characters' })
    background_image?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Hero image must be a valid URL' })
    @MaxLength(2048, { message: 'Hero image URL cannot exceed 2048 characters' })
    hero_image?: string;

    @IsOptional()
    @IsObject({ message: 'Custom data must be an object' })
    custom_data?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    created_by?: number; // Set by controller from authenticated user
}

export class UpdateHeroDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsString({ message: 'Title must be a string' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Subtitle must be a string' })
    @MaxLength(500, { message: 'Subtitle cannot exceed 500 characters' })
    subtitle?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Primary button text must be a string' })
    @MaxLength(100, { message: 'Primary button text cannot exceed 100 characters' })
    primary_button_text?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Primary button link must be a valid URL' })
    @MaxLength(2048, { message: 'Primary button link cannot exceed 2048 characters' })
    primary_button_link?: string;

    @IsOptional()
    @IsString({ message: 'Secondary button text must be a string' })
    @MaxLength(100, { message: 'Secondary button text cannot exceed 100 characters' })
    secondary_button_text?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Secondary button link must be a valid URL' })
    @MaxLength(2048, { message: 'Secondary button link cannot exceed 2048 characters' })
    secondary_button_link?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Background image must be a valid URL' })
    @MaxLength(2048, { message: 'Background image URL cannot exceed 2048 characters' })
    background_image?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Hero image must be a valid URL' })
    @MaxLength(2048, { message: 'Hero image URL cannot exceed 2048 characters' })
    hero_image?: string;

    @IsOptional()
    @IsObject({ message: 'Custom data must be an object' })
    custom_data?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    updated_by?: number; // Set by controller from authenticated user
}

// ==================== TRUSTED COMPANIES DTOs ====================

export class CreateTrustedCompanyDto {
    @IsNotEmpty({ message: 'Company name is required' })
    @IsString({ message: 'Company name must be a string' })
    @MaxLength(255, { message: 'Company name cannot exceed 255 characters' })
    company_name: string;

    @IsNotEmpty({ message: 'Logo URL is required' })
    @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    @MaxLength(2048, { message: 'Logo URL cannot exceed 2048 characters' })
    logo_url: string;

    @IsOptional()
    @IsUrl({}, { message: 'Website URL must be a valid URL' })
    @MaxLength(2048, { message: 'Website URL cannot exceed 2048 characters' })
    website_url?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
    description?: string;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    created_by?: number;
}

export class UpdateTrustedCompanyDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsString({ message: 'Company name must be a string' })
    @MaxLength(255, { message: 'Company name cannot exceed 255 characters' })
    company_name?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    @MaxLength(2048, { message: 'Logo URL cannot exceed 2048 characters' })
    logo_url?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Website URL must be a valid URL' })
    @MaxLength(2048, { message: 'Website URL cannot exceed 2048 characters' })
    website_url?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
    description?: string;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    updated_by?: number;
}

// ==================== WHY CHOOSE US DTOs ====================

export class CreateWhyChooseUsDto {
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title: string;

    @IsNotEmpty({ message: 'Content is required' })
    @IsString({ message: 'Content must be a string' })
    @MaxLength(5000, { message: 'Content cannot exceed 5000 characters' })
    content: string;

    @IsOptional()
    @IsString({ message: 'Icon must be a string' })
    @MaxLength(255, { message: 'Icon cannot exceed 255 characters' })
    icon?: string;

    @IsOptional()
    @IsObject({ message: 'Metadata must be an object' })
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    created_by?: number;
}

export class UpdateWhyChooseUsDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsString({ message: 'Title must be a string' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Content must be a string' })
    @MaxLength(5000, { message: 'Content cannot exceed 5000 characters' })
    content?: string;

    @IsOptional()
    @IsString({ message: 'Icon must be a string' })
    @MaxLength(255, { message: 'Icon cannot exceed 255 characters' })
    icon?: string;

    @IsOptional()
    @IsObject({ message: 'Metadata must be an object' })
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    updated_by?: number;
}

// ==================== FEATURED CREATORS DTOs ====================

export class CreateFeaturedCreatorDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Title must be a string' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Bio must be a string' })
    @MaxLength(2000, { message: 'Bio cannot exceed 2000 characters' })
    bio?: string;

    @IsNotEmpty({ message: 'Profile image is required' })
    @IsUrl({}, { message: 'Profile image must be a valid URL' })
    @MaxLength(2048, { message: 'Profile image URL cannot exceed 2048 characters' })
    profile_image: string;

    @IsOptional()
    @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
    @MaxLength(2048, { message: 'Portfolio URL cannot exceed 2048 characters' })
    portfolio_url?: string;

    @IsOptional()
    @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
    @MaxLength(2048, { message: 'LinkedIn URL cannot exceed 2048 characters' })
    social_linkedin?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Twitter URL must be a valid URL' })
    @MaxLength(2048, { message: 'Twitter URL cannot exceed 2048 characters' })
    social_twitter?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Instagram URL must be a valid URL' })
    @MaxLength(2048, { message: 'Instagram URL cannot exceed 2048 characters' })
    social_instagram?: string;

    @IsOptional()
    @IsArray({ message: 'Skills must be an array' })
    @IsString({ each: true, message: 'Each skill must be a string' })
    @MaxLength(100, { each: true, message: 'Each skill cannot exceed 100 characters' })
    skills?: string[];

    @IsOptional()
    @IsObject({ message: 'Stats must be an object' })
    stats?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    created_by?: number;
}

export class UpdateFeaturedCreatorDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Title must be a string' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Bio must be a string' })
    @MaxLength(2000, { message: 'Bio cannot exceed 2000 characters' })
    bio?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Profile image must be a valid URL' })
    @MaxLength(2048, { message: 'Profile image URL cannot exceed 2048 characters' })
    profile_image?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
    @MaxLength(2048, { message: 'Portfolio URL cannot exceed 2048 characters' })
    portfolio_url?: string;

    @IsOptional()
    @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
    @MaxLength(2048, { message: 'LinkedIn URL cannot exceed 2048 characters' })
    social_linkedin?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Twitter URL must be a valid URL' })
    @MaxLength(2048, { message: 'Twitter URL cannot exceed 2048 characters' })
    social_twitter?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Instagram URL must be a valid URL' })
    @MaxLength(2048, { message: 'Instagram URL cannot exceed 2048 characters' })
    social_instagram?: string;

    @IsOptional()
    @IsArray({ message: 'Skills must be an array' })
    @IsString({ each: true, message: 'Each skill must be a string' })
    @MaxLength(100, { each: true, message: 'Each skill cannot exceed 100 characters' })
    skills?: string[];

    @IsOptional()
    @IsObject({ message: 'Stats must be an object' })
    stats?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    updated_by?: number;
}

// ==================== SUCCESS STORIES DTOs ====================

export class CreateSuccessStoryDto {
    @IsNotEmpty({ message: 'Client name is required' })
    @IsString({ message: 'Client name must be a string' })
    @MaxLength(255, { message: 'Client name cannot exceed 255 characters' })
    client_name: string;

    @IsOptional()
    @IsString({ message: 'Client title must be a string' })
    @MaxLength(255, { message: 'Client title cannot exceed 255 characters' })
    client_title?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Client image must be a valid URL' })
    @MaxLength(2048, { message: 'Client image URL cannot exceed 2048 characters' })
    client_image?: string;

    @IsNotEmpty({ message: 'Testimonial is required' })
    @IsString({ message: 'Testimonial must be a string' })
    @MaxLength(5000, { message: 'Testimonial cannot exceed 5000 characters' })
    testimonial: string;

    @IsOptional()
    @IsInt({ message: 'Rating must be an integer' })
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating cannot exceed 5' })
    rating?: number;

    @IsOptional()
    @IsString({ message: 'Project type must be a string' })
    @MaxLength(100, { message: 'Project type cannot exceed 100 characters' })
    project_type?: string;

    @IsOptional()
    @IsString({ message: 'Company must be a string' })
    @MaxLength(255, { message: 'Company cannot exceed 255 characters' })
    company?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Company logo must be a valid URL' })
    @MaxLength(2048, { message: 'Company logo URL cannot exceed 2048 characters' })
    company_logo?: string;

    @IsOptional()
    @IsObject({ message: 'Metadata must be an object' })
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    created_by?: number;
}

export class UpdateSuccessStoryDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsString({ message: 'Client name must be a string' })
    @MaxLength(255, { message: 'Client name cannot exceed 255 characters' })
    client_name?: string;

    @IsOptional()
    @IsString({ message: 'Client title must be a string' })
    @MaxLength(255, { message: 'Client title cannot exceed 255 characters' })
    client_title?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Client image must be a valid URL' })
    @MaxLength(2048, { message: 'Client image URL cannot exceed 2048 characters' })
    client_image?: string;

    @IsOptional()
    @IsString({ message: 'Testimonial must be a string' })
    @MaxLength(5000, { message: 'Testimonial cannot exceed 5000 characters' })
    testimonial?: string;

    @IsOptional()
    @IsInt({ message: 'Rating must be an integer' })
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating cannot exceed 5' })
    rating?: number;

    @IsOptional()
    @IsString({ message: 'Project type must be a string' })
    @MaxLength(100, { message: 'Project type cannot exceed 100 characters' })
    project_type?: string;

    @IsOptional()
    @IsString({ message: 'Company must be a string' })
    @MaxLength(255, { message: 'Company cannot exceed 255 characters' })
    company?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Company logo must be a valid URL' })
    @MaxLength(2048, { message: 'Company logo URL cannot exceed 2048 characters' })
    company_logo?: string;

    @IsOptional()
    @IsObject({ message: 'Metadata must be an object' })
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    updated_by?: number;
}

// ==================== LANDING FAQs DTOs ====================

export class CreateLandingFaqDto {
    @IsOptional()
    @IsString({ message: 'Category must be a string' })
    @MaxLength(100, { message: 'Category cannot exceed 100 characters' })
    category?: string;

    @IsNotEmpty({ message: 'Question is required' })
    @IsString({ message: 'Question must be a string' })
    @MaxLength(500, { message: 'Question cannot exceed 500 characters' })
    question: string;

    @IsNotEmpty({ message: 'Answer is required' })
    @IsString({ message: 'Answer must be a string' })
    @MaxLength(5000, { message: 'Answer cannot exceed 5000 characters' })
    answer: string;

    @IsOptional()
    @IsArray({ message: 'Tags must be an array' })
    @IsString({ each: true, message: 'Each tag must be a string' })
    @MaxLength(50, { each: true, message: 'Each tag cannot exceed 50 characters' })
    tags?: string[];

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    created_by?: number;
}

export class UpdateLandingFaqDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsString({ message: 'Category must be a string' })
    @MaxLength(100, { message: 'Category cannot exceed 100 characters' })
    category?: string;

    @IsOptional()
    @IsString({ message: 'Question must be a string' })
    @MaxLength(500, { message: 'Question cannot exceed 500 characters' })
    question?: string;

    @IsOptional()
    @IsString({ message: 'Answer must be a string' })
    @MaxLength(5000, { message: 'Answer cannot exceed 5000 characters' })
    answer?: string;

    @IsOptional()
    @IsArray({ message: 'Tags must be an array' })
    @IsString({ each: true, message: 'Each tag must be a string' })
    @MaxLength(50, { each: true, message: 'Each tag cannot exceed 50 characters' })
    tags?: string[];

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    @IsOptional()
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order?: number;

    updated_by?: number;
}

// ==================== REORDER DTOs ====================

export class ReorderItemDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsNotEmpty({ message: 'Sort order is required' })
    @IsInt({ message: 'Sort order must be an integer' })
    @Min(0, { message: 'Sort order cannot be negative' })
    @Max(9999, { message: 'Sort order cannot exceed 9999' })
    sort_order: number;
}

export class BulkReorderDto {
    @IsNotEmpty({ message: 'Items array is required' })
    @IsArray({ message: 'Items must be an array' })
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items: ReorderItemDto[];
}

// ==================== DELETE DTOs ====================

export class DeleteItemDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    deleted_by?: number; // Set by controller from authenticated user
}
