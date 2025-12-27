import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  IsUrl,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
  Matches,
  IsEmail,
} from "class-validator";
import { Type } from "class-transformer";

// ==================== HERO SECTION DTOs ====================
// Fields: title, subtitle, hero_left_image, hero_right_image, background_image (legacy)

export class CreateHeroDto {
  @IsNotEmpty({ message: "Title is required" })
  @IsString({ message: "Title must be a string" })
  @MaxLength(255, { message: "Title cannot exceed 255 characters" })
  title: string;

  @IsOptional()
  @IsString({ message: "Subtitle must be a string" })
  @MaxLength(500, { message: "Subtitle cannot exceed 500 characters" })
  subtitle?: string;

  @IsOptional()
  @IsString({ message: "Hero left image must be a string (URL)" })
  @MaxLength(2048, {
    message: "Hero left image URL cannot exceed 2048 characters",
  })
  hero_left_image?: string;

  @IsOptional()
  @IsString({ message: "Hero right image must be a string (URL)" })
  @MaxLength(2048, {
    message: "Hero right image URL cannot exceed 2048 characters",
  })
  hero_right_image?: string;

  @IsOptional()
  @IsUrl({}, { message: "Background image must be a valid URL" })
  @MaxLength(2048, {
    message: "Background image URL cannot exceed 2048 characters",
  })
  background_image?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  created_by?: number; // Set by controller from authenticated user
}

export class UpdateHeroDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MaxLength(255, { message: "Title cannot exceed 255 characters" })
  title?: string;

  @IsOptional()
  @IsString({ message: "Subtitle must be a string" })
  @MaxLength(500, { message: "Subtitle cannot exceed 500 characters" })
  subtitle?: string;

  @IsOptional()
  @IsString({ message: "Hero left image must be a string (URL)" })
  @MaxLength(2048, {
    message: "Hero left image URL cannot exceed 2048 characters",
  })
  hero_left_image?: string;

  @IsOptional()
  @IsString({ message: "Hero right image must be a string (URL)" })
  @MaxLength(2048, {
    message: "Hero right image URL cannot exceed 2048 characters",
  })
  hero_right_image?: string;

  @IsOptional()
  @IsUrl({}, { message: "Background image must be a valid URL" })
  @MaxLength(2048, {
    message: "Background image URL cannot exceed 2048 characters",
  })
  background_image?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  updated_by?: number; // Set by controller from authenticated user
}

// ==================== TRUSTED COMPANIES DTOs ====================
// Fields: company_name, logo_url, description, sort_order

export class CreateTrustedCompanyDto {
  @IsNotEmpty({ message: "Company name is required" })
  @IsString({ message: "Company name must be a string" })
  @MaxLength(255, { message: "Company name cannot exceed 255 characters" })
  company_name: string;

  @IsNotEmpty({ message: "Logo URL is required" })
  @IsUrl({}, { message: "Logo URL must be a valid URL" })
  @MaxLength(2048, { message: "Logo URL cannot exceed 2048 characters" })
  logo_url: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  created_by?: number;
}

export class UpdateTrustedCompanyDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsString({ message: "Company name must be a string" })
  @MaxLength(255, { message: "Company name cannot exceed 255 characters" })
  company_name?: string;

  @IsOptional()
  @IsUrl({}, { message: "Logo URL must be a valid URL" })
  @MaxLength(2048, { message: "Logo URL cannot exceed 2048 characters" })
  logo_url?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  updated_by?: number;
}

// ==================== WHY CHOOSE US DTOs ====================
// Fields: title (section title), point_1-5 with descriptions, sort_order

export class CreateWhyChooseUsDto {
  @IsNotEmpty({ message: "Title is required" })
  @IsString({ message: "Title must be a string" })
  @MaxLength(255, { message: "Title cannot exceed 255 characters" })
  title: string; // Section title

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(5000, { message: "Description cannot exceed 5000 characters" })
  description?: string; // Legacy field, optional

  // Point 1
  @IsOptional()
  @IsString({ message: "Point 1 must be a string" })
  @MaxLength(255, { message: "Point 1 cannot exceed 255 characters" })
  point_1?: string;

  @IsOptional()
  @IsString({ message: "Point 1 description must be a string" })
  @MaxLength(2000, {
    message: "Point 1 description cannot exceed 2000 characters",
  })
  point_1_description?: string;

  // Point 2
  @IsOptional()
  @IsString({ message: "Point 2 must be a string" })
  @MaxLength(255, { message: "Point 2 cannot exceed 255 characters" })
  point_2?: string;

  @IsOptional()
  @IsString({ message: "Point 2 description must be a string" })
  @MaxLength(2000, {
    message: "Point 2 description cannot exceed 2000 characters",
  })
  point_2_description?: string;

  // Point 3
  @IsOptional()
  @IsString({ message: "Point 3 must be a string" })
  @MaxLength(255, { message: "Point 3 cannot exceed 255 characters" })
  point_3?: string;

  @IsOptional()
  @IsString({ message: "Point 3 description must be a string" })
  @MaxLength(2000, {
    message: "Point 3 description cannot exceed 2000 characters",
  })
  point_3_description?: string;

  // Point 4
  @IsOptional()
  @IsString({ message: "Point 4 must be a string" })
  @MaxLength(255, { message: "Point 4 cannot exceed 255 characters" })
  point_4?: string;

  @IsOptional()
  @IsString({ message: "Point 4 description must be a string" })
  @MaxLength(2000, {
    message: "Point 4 description cannot exceed 2000 characters",
  })
  point_4_description?: string;

  // Point 5
  @IsOptional()
  @IsString({ message: "Point 5 must be a string" })
  @MaxLength(255, { message: "Point 5 cannot exceed 255 characters" })
  point_5?: string;

  @IsOptional()
  @IsString({ message: "Point 5 description must be a string" })
  @MaxLength(2000, {
    message: "Point 5 description cannot exceed 2000 characters",
  })
  point_5_description?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  created_by?: number;
}

export class UpdateWhyChooseUsDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MaxLength(255, { message: "Title cannot exceed 255 characters" })
  title?: string; // Section title

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(5000, { message: "Description cannot exceed 5000 characters" })
  description?: string; // Legacy field, optional

  // Point 1
  @IsOptional()
  @IsString({ message: "Point 1 must be a string" })
  @MaxLength(255, { message: "Point 1 cannot exceed 255 characters" })
  point_1?: string;

  @IsOptional()
  @IsString({ message: "Point 1 description must be a string" })
  @MaxLength(2000, {
    message: "Point 1 description cannot exceed 2000 characters",
  })
  point_1_description?: string;

  // Point 2
  @IsOptional()
  @IsString({ message: "Point 2 must be a string" })
  @MaxLength(255, { message: "Point 2 cannot exceed 255 characters" })
  point_2?: string;

  @IsOptional()
  @IsString({ message: "Point 2 description must be a string" })
  @MaxLength(2000, {
    message: "Point 2 description cannot exceed 2000 characters",
  })
  point_2_description?: string;

  // Point 3
  @IsOptional()
  @IsString({ message: "Point 3 must be a string" })
  @MaxLength(255, { message: "Point 3 cannot exceed 255 characters" })
  point_3?: string;

  @IsOptional()
  @IsString({ message: "Point 3 description must be a string" })
  @MaxLength(2000, {
    message: "Point 3 description cannot exceed 2000 characters",
  })
  point_3_description?: string;

  // Point 4
  @IsOptional()
  @IsString({ message: "Point 4 must be a string" })
  @MaxLength(255, { message: "Point 4 cannot exceed 255 characters" })
  point_4?: string;

  @IsOptional()
  @IsString({ message: "Point 4 description must be a string" })
  @MaxLength(2000, {
    message: "Point 4 description cannot exceed 2000 characters",
  })
  point_4_description?: string;

  // Point 5
  @IsOptional()
  @IsString({ message: "Point 5 must be a string" })
  @MaxLength(255, { message: "Point 5 cannot exceed 255 characters" })
  point_5?: string;

  @IsOptional()
  @IsString({ message: "Point 5 description must be a string" })
  @MaxLength(2000, {
    message: "Point 5 description cannot exceed 2000 characters",
  })
  point_5_description?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  updated_by?: number;
}

// ==================== FEATURED CREATORS DTOs ====================
// Fields: name, title, bio, profile_image, skills, stats, portfolio_url, social_links, sort_order

export class CreateFeaturedCreatorDto {
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  @MaxLength(255, { message: "Name cannot exceed 255 characters" })
  name: string;

  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MaxLength(255, { message: "Title cannot exceed 255 characters" })
  title?: string;

  @IsOptional()
  @IsString({ message: "Bio must be a string" })
  @MaxLength(2000, { message: "Bio cannot exceed 2000 characters" })
  bio?: string;

  @IsOptional()
  @IsString({ message: "Profile image must be a string" })
  @MaxLength(2048, {
    message: "Profile image URL cannot exceed 2048 characters",
  })
  profile_image?: string;

  @IsOptional()
  @IsArray({ message: "Skills must be an array" })
  @IsString({ each: true, message: "Each skill must be a string" })
  skills?: string[];

  @IsOptional()
  @IsObject({ message: "Stats must be an object" })
  stats?: any;

  @IsOptional()
  @IsUrl({}, { message: "Portfolio URL must be a valid URL" })
  @MaxLength(2048, { message: "Portfolio URL cannot exceed 2048 characters" })
  portfolio_url?: string;

  @IsOptional()
  @IsUrl({}, { message: "LinkedIn URL must be a valid URL" })
  @MaxLength(255, { message: "LinkedIn URL cannot exceed 255 characters" })
  social_linkedin?: string;

  @IsOptional()
  @IsUrl({}, { message: "Twitter URL must be a valid URL" })
  @MaxLength(255, { message: "Twitter URL cannot exceed 255 characters" })
  social_twitter?: string;

  @IsOptional()
  @IsUrl({}, { message: "Instagram URL must be a valid URL" })
  @MaxLength(255, { message: "Instagram URL cannot exceed 255 characters" })
  social_instagram?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  created_by?: number;
}

export class UpdateFeaturedCreatorDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @MaxLength(255, { message: "Name cannot exceed 255 characters" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MaxLength(255, { message: "Title cannot exceed 255 characters" })
  title?: string;

  @IsOptional()
  @IsString({ message: "Bio must be a string" })
  @MaxLength(2000, { message: "Bio cannot exceed 2000 characters" })
  bio?: string;

  @IsOptional()
  @IsString({ message: "Profile image must be a string" })
  @MaxLength(2048, {
    message: "Profile image URL cannot exceed 2048 characters",
  })
  profile_image?: string;

  @IsOptional()
  @IsArray({ message: "Skills must be an array" })
  @IsString({ each: true, message: "Each skill must be a string" })
  skills?: string[];

  @IsOptional()
  @IsObject({ message: "Stats must be an object" })
  stats?: any;

  @IsOptional()
  @IsUrl({}, { message: "Portfolio URL must be a valid URL" })
  @MaxLength(2048, { message: "Portfolio URL cannot exceed 2048 characters" })
  portfolio_url?: string;

  @IsOptional()
  @IsUrl({}, { message: "LinkedIn URL must be a valid URL" })
  @MaxLength(255, { message: "LinkedIn URL cannot exceed 255 characters" })
  social_linkedin?: string;

  @IsOptional()
  @IsUrl({}, { message: "Twitter URL must be a valid URL" })
  @MaxLength(255, { message: "Twitter URL cannot exceed 255 characters" })
  social_twitter?: string;

  @IsOptional()
  @IsUrl({}, { message: "Instagram URL must be a valid URL" })
  @MaxLength(255, { message: "Instagram URL cannot exceed 255 characters" })
  social_instagram?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  updated_by?: number;
}

// ==================== SUCCESS STORIES DTOs ====================
// Fields: client_name, client_title, client_image, testimonial, rating, company, company_logo, project_type, sort_order

export class CreateSuccessStoryDto {
  @IsNotEmpty({ message: "Client name is required" })
  @IsString({ message: "Client name must be a string" })
  @MaxLength(255, { message: "Client name cannot exceed 255 characters" })
  client_name: string;

  @IsOptional()
  @IsString({ message: "Client title must be a string" })
  @MaxLength(255, { message: "Client title cannot exceed 255 characters" })
  client_title?: string;

  @IsOptional()
  @IsString({ message: "Client image must be a string (URL)" })
  @MaxLength(2048, {
    message: "Client image URL cannot exceed 2048 characters",
  })
  client_image?: string;

  @IsNotEmpty({ message: "Testimonial is required" })
  @IsString({ message: "Testimonial must be a string" })
  @MaxLength(5000, { message: "Testimonial cannot exceed 5000 characters" })
  testimonial: string;

  @IsOptional()
  @IsInt({ message: "Rating must be an integer" })
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating cannot exceed 5" })
  rating?: number;

  @IsOptional()
  @IsString({ message: "Company must be a string" })
  @MaxLength(255, { message: "Company cannot exceed 255 characters" })
  company?: string;

  @IsOptional()
  @IsString({ message: "Company logo must be a string (URL)" })
  @MaxLength(2048, {
    message: "Company logo URL cannot exceed 2048 characters",
  })
  company_logo?: string;

  @IsOptional()
  @IsString({ message: "Project type must be a string" })
  @MaxLength(255, { message: "Project type cannot exceed 255 characters" })
  project_type?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  created_by?: number;
}

export class UpdateSuccessStoryDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsString({ message: "Client name must be a string" })
  @MaxLength(255, { message: "Client name cannot exceed 255 characters" })
  client_name?: string;

  @IsOptional()
  @IsString({ message: "Client title must be a string" })
  @MaxLength(255, { message: "Client title cannot exceed 255 characters" })
  client_title?: string;

  @IsOptional()
  @IsString({ message: "Client image must be a string (URL)" })
  @MaxLength(2048, {
    message: "Client image URL cannot exceed 2048 characters",
  })
  client_image?: string;

  @IsOptional()
  @IsString({ message: "Testimonial must be a string" })
  @MaxLength(5000, { message: "Testimonial cannot exceed 5000 characters" })
  testimonial?: string;

  @IsOptional()
  @IsInt({ message: "Rating must be an integer" })
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating cannot exceed 5" })
  rating?: number;

  @IsOptional()
  @IsString({ message: "Company must be a string" })
  @MaxLength(255, { message: "Company cannot exceed 255 characters" })
  company?: string;

  @IsOptional()
  @IsString({ message: "Company logo must be a string (URL)" })
  @MaxLength(2048, {
    message: "Company logo URL cannot exceed 2048 characters",
  })
  company_logo?: string;

  @IsOptional()
  @IsString({ message: "Project type must be a string" })
  @MaxLength(255, { message: "Project type cannot exceed 255 characters" })
  project_type?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  updated_by?: number;
}

// ==================== LANDING FAQs DTOs ====================
// Fields: question, answer, category, tags, sort_order

export class CreateLandingFaqDto {
  @IsNotEmpty({ message: "Question is required" })
  @IsString({ message: "Question must be a string" })
  @MaxLength(500, { message: "Question cannot exceed 500 characters" })
  question: string;

  @IsNotEmpty({ message: "Answer is required" })
  @IsString({ message: "Answer must be a string" })
  @MaxLength(5000, { message: "Answer cannot exceed 5000 characters" })
  answer: string;

  @IsOptional()
  @IsString({ message: "Category must be a string" })
  @MaxLength(255, { message: "Category cannot exceed 255 characters" })
  category?: string;

  @IsOptional()
  @IsArray({ message: "Tags must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  created_by?: number;
}

export class UpdateLandingFaqDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsString({ message: "Question must be a string" })
  @MaxLength(500, { message: "Question cannot exceed 500 characters" })
  question?: string;

  @IsOptional()
  @IsString({ message: "Answer must be a string" })
  @MaxLength(5000, { message: "Answer cannot exceed 5000 characters" })
  answer?: string;

  @IsOptional()
  @IsString({ message: "Category must be a string" })
  @MaxLength(255, { message: "Category cannot exceed 255 characters" })
  category?: string;

  @IsOptional()
  @IsArray({ message: "Tags must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  tags?: string[];

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  @IsOptional()
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order?: number;

  updated_by?: number;
}

// ==================== SOCIAL MEDIA DTOs ====================
// Fields: social_whatsapp, social_linkedin, social_google, social_instagram

export class CreateSocialMediaDto {
  @IsOptional()
  @IsUrl({}, { message: "WhatsApp URL must be a valid URL" })
  @MaxLength(255, { message: "WhatsApp URL cannot exceed 255 characters" })
  social_whatsapp?: string;

  @IsOptional()
  @IsUrl({}, { message: "LinkedIn URL must be a valid URL" })
  @MaxLength(255, { message: "LinkedIn URL cannot exceed 255 characters" })
  social_linkedin?: string;

  @IsOptional()
  @IsUrl({}, { message: "Google URL must be a valid URL" })
  @MaxLength(255, { message: "Google URL cannot exceed 255 characters" })
  social_google?: string;

  @IsOptional()
  @IsUrl({}, { message: "Instagram URL must be a valid URL" })
  @MaxLength(255, { message: "Instagram URL cannot exceed 255 characters" })
  social_instagram?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  created_by?: number;
}

export class UpdateSocialMediaDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsOptional()
  @IsUrl({}, { message: "WhatsApp URL must be a valid URL" })
  @MaxLength(255, { message: "WhatsApp URL cannot exceed 255 characters" })
  social_whatsapp?: string;

  @IsOptional()
  @IsUrl({}, { message: "LinkedIn URL must be a valid URL" })
  @MaxLength(255, { message: "LinkedIn URL cannot exceed 255 characters" })
  social_linkedin?: string;

  @IsOptional()
  @IsUrl({}, { message: "Google URL must be a valid URL" })
  @MaxLength(255, { message: "Google URL cannot exceed 255 characters" })
  social_google?: string;

  @IsOptional()
  @IsUrl({}, { message: "Instagram URL must be a valid URL" })
  @MaxLength(255, { message: "Instagram URL cannot exceed 255 characters" })
  social_instagram?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active must be a boolean" })
  is_active?: boolean;

  updated_by?: number;
}

// ==================== REORDER DTOs ====================

export class ReorderItemDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  @IsNotEmpty({ message: "Sort order is required" })
  @IsInt({ message: "Sort order must be an integer" })
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sort_order: number;
}

export class BulkReorderDto {
  @IsNotEmpty({ message: "Items array is required" })
  @IsArray({ message: "Items must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

// ==================== DELETE DTOs ====================

export class DeleteItemDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsInt({ message: "ID must be an integer" })
  @Min(1, { message: "ID must be a positive integer" })
  id: number;

  deleted_by?: number; // Set by controller from authenticated user
}
