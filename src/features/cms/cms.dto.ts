import { 
    IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, 
    IsObject, IsUrl, MaxLength, MinLength, Min, Max, IsInt, IsNotEmpty, Matches, IsEmail
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== HERO SECTION DTOs ====================
// Fields: title, subtitle, background_image

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
    @IsUrl({}, { message: 'Background image must be a valid URL' })
    @MaxLength(2048, { message: 'Background image URL cannot exceed 2048 characters' })
    background_image?: string;

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
    @IsUrl({}, { message: 'Background image must be a valid URL' })
    @MaxLength(2048, { message: 'Background image URL cannot exceed 2048 characters' })
    background_image?: string;

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
// Fields: company_name, logo_url, sort_order

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
// Fields: question (stored in title), answer (stored in description), sort_order

export class CreateWhyChooseUsDto {
    @IsNotEmpty({ message: 'Question is required' })
    @IsString({ message: 'Question must be a string' })
    @MaxLength(255, { message: 'Question cannot exceed 255 characters' })
    title: string; // Stores question

    @IsNotEmpty({ message: 'Answer is required' })
    @IsString({ message: 'Answer must be a string' })
    @MaxLength(5000, { message: 'Answer cannot exceed 5000 characters' })
    description: string; // Stores answer

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
    @IsString({ message: 'Question must be a string' })
    @MaxLength(255, { message: 'Question cannot exceed 255 characters' })
    title?: string; // Stores question

    @IsOptional()
    @IsString({ message: 'Answer must be a string' })
    @MaxLength(5000, { message: 'Answer cannot exceed 5000 characters' })
    description?: string; // Stores answer

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
// Fields: name, bio, sort_order

export class CreateFeaturedCreatorDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Bio must be a string' })
    @MaxLength(2000, { message: 'Bio cannot exceed 2000 characters' })
    bio?: string;

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
    @IsString({ message: 'Bio must be a string' })
    @MaxLength(2000, { message: 'Bio cannot exceed 2000 characters' })
    bio?: string;

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
// Fields: client_name, client_title, testimonial, rating, sort_order

export class CreateSuccessStoryDto {
    @IsNotEmpty({ message: 'Client name is required' })
    @IsString({ message: 'Client name must be a string' })
    @MaxLength(255, { message: 'Client name cannot exceed 255 characters' })
    client_name: string;

    @IsOptional()
    @IsString({ message: 'Client title must be a string' })
    @MaxLength(255, { message: 'Client title cannot exceed 255 characters' })
    client_title?: string;

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
    @IsString({ message: 'Testimonial must be a string' })
    @MaxLength(5000, { message: 'Testimonial cannot exceed 5000 characters' })
    testimonial?: string;

    @IsOptional()
    @IsInt({ message: 'Rating must be an integer' })
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating cannot exceed 5' })
    rating?: number;

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
// Fields: question, answer, sort_order

export class CreateLandingFaqDto {
    @IsNotEmpty({ message: 'Question is required' })
    @IsString({ message: 'Question must be a string' })
    @MaxLength(500, { message: 'Question cannot exceed 500 characters' })
    question: string;

    @IsNotEmpty({ message: 'Answer is required' })
    @IsString({ message: 'Answer must be a string' })
    @MaxLength(5000, { message: 'Answer cannot exceed 5000 characters' })
    answer: string;

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
    @IsString({ message: 'Question must be a string' })
    @MaxLength(500, { message: 'Question cannot exceed 500 characters' })
    question?: string;

    @IsOptional()
    @IsString({ message: 'Answer must be a string' })
    @MaxLength(5000, { message: 'Answer cannot exceed 5000 characters' })
    answer?: string;

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

// ==================== SOCIAL MEDIA DTOs ====================
// Fields: social_whatsapp, social_linkedin, social_google, social_instagram

export class CreateSocialMediaDto {
    @IsOptional()
    @IsUrl({}, { message: 'WhatsApp URL must be a valid URL' })
    @MaxLength(255, { message: 'WhatsApp URL cannot exceed 255 characters' })
    social_whatsapp?: string;

    @IsOptional()
    @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
    @MaxLength(255, { message: 'LinkedIn URL cannot exceed 255 characters' })
    social_linkedin?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Google URL must be a valid URL' })
    @MaxLength(255, { message: 'Google URL cannot exceed 255 characters' })
    social_google?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Instagram URL must be a valid URL' })
    @MaxLength(255, { message: 'Instagram URL cannot exceed 255 characters' })
    social_instagram?: string;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

    created_by?: number;
}

export class UpdateSocialMediaDto {
    @IsNotEmpty({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'ID must be a positive integer' })
    id: number;

    @IsOptional()
    @IsUrl({}, { message: 'WhatsApp URL must be a valid URL' })
    @MaxLength(255, { message: 'WhatsApp URL cannot exceed 255 characters' })
    social_whatsapp?: string;

    @IsOptional()
    @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
    @MaxLength(255, { message: 'LinkedIn URL cannot exceed 255 characters' })
    social_linkedin?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Google URL must be a valid URL' })
    @MaxLength(255, { message: 'Google URL cannot exceed 255 characters' })
    social_google?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Instagram URL must be a valid URL' })
    @MaxLength(255, { message: 'Instagram URL cannot exceed 255 characters' })
    social_instagram?: string;

    @IsOptional()
    @IsBoolean({ message: 'is_active must be a boolean' })
    is_active?: boolean;

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
