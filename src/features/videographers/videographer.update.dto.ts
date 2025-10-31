// Unified Videographer Update DTO - For updating both user and profile fields
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  IsBoolean,
  IsEmail,
  IsUrl
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Unified DTO for updating videographer profile information
 * Handles both users table fields and freelancer_profiles table fields
 * All fields are optional - only provided fields will be updated
 */
export class VideographerUpdateDto {
  // User Table Fields (from users table)
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @IsOptional()
  @IsUrl()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  address_line_first?: string;

  @IsOptional()
  @IsString()
  address_line_second?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  // Freelancer Profile Fields (from freelancer_profiles table)
  @IsOptional()
  @IsString()
  profile_title?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsEnum(['entry', 'intermediate', 'expert', 'master'])
  experience_level?: string;

  // Skills & Expertise
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  software_skills?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  superpowers?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  skill_tags?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  base_skills?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  languages?: string[];

  // Portfolio & Credentials
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  portfolio_links?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  certification?: object;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  education?: object;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  previous_works?: object;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  services?: object;

  // Pricing & Availability
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  work_type?: string;

  @IsOptional()
  @IsString()
  hours_per_week?: string;

  // Verification
  @IsOptional()
  @IsString()
  id_type?: string;

  @IsOptional()
  @IsString()
  id_document_url?: string;

  @IsOptional()
  @IsBoolean()
  kyc_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  aadhaar_verification?: boolean;

  // Payment
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  payment_method?: object;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  bank_account_info?: object;
}
