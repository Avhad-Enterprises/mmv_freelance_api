// Unified Client Profile Update DTO - For updating both user and client profile fields
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Unified DTO for updating client profile information
 * Handles both users table fields and client_profiles table fields
 * All fields are optional - only provided fields will be updated
 */
export class ClientProfileUpdateDto {
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

  // Address
  @IsOptional()
  @IsString()
  address?: string;

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

  // Client Profile Fields (from client_profiles table)
  // Company Info
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsEnum([
    'film_production',
    'ad_agency',
    'marketing',
    'events',
    'real_estate',
    'education',
    'e_commerce',
    'technology',
    'entertainment',
    'corporate',
    'other'
  ])
  industry?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // If it's a string starting with http, treat it as a plain string
      if (value.startsWith('http') || value.startsWith('https')) {
        return value;
      }
      // Try to parse as JSON, but if it fails, return the string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  social_links?: any;

  @IsOptional()
  @IsEnum(['1-10', '11-50', '51-200', '201-500', '500+'])
  company_size?: string;

  // Requirements
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  required_services?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  required_skills?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  required_editor_proficiencies?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  required_videographer_proficiencies?: string[];

  // Budget
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget_max?: number;

  // Business Details
  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  business_document_urls?: string[];

  // Preferences
  @IsOptional()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_arrangement?: string;

  @IsOptional()
  @IsEnum(['one_time', 'recurring', 'long_term', 'ongoing'])
  project_frequency?: string;

  @IsOptional()
  @IsEnum(['individuals', 'agencies', 'both'])
  hiring_preferences?: string;

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
