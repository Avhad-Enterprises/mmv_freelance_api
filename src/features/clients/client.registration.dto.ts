// Client Registration DTO
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsEnum, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ClientRegistrationDto {
  // Step 1: Basic Information (Required)
  @IsNotEmpty()
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  // Step 2: Company Information (Required)
  @IsNotEmpty()
  company_name: string;

  @IsOptional()
  company_website?: string;

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
  company_description?: string;

  @IsNotEmpty()
  @IsEnum(['film', 'ad_agency', 'events', 'youtube', 'corporate', 'other'])
  industry: string;

  @IsNotEmpty()
  @IsEnum(['1-10', '11-50', '51-200', '200+'])
  company_size: string;

  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  city: string;

  // Step 3: Contact Information (Required)
  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  zip_code?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  // Step 4: Work Preferences (Optional)
  @IsOptional()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_arrangement?: string;

  @IsOptional()
  @IsEnum(['one_time', 'occasional', 'ongoing'])
  project_frequency?: string;

  @IsOptional()
  @IsEnum(['individuals', 'agencies', 'both'])
  hiring_preferences?: string;

  // Step 5: Project Information (Optional)
  @IsOptional()
  project_title?: string;

  @IsOptional()
  project_description?: string;

  @IsOptional()
  project_category?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsNumber()
  project_budget?: number;

  @IsOptional()
  project_timeline?: string;

  // Step 6: Additional Information (Required)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  terms_accepted?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  privacy_policy_accepted?: boolean;

  // Optional file uploads
  @IsOptional()
  profile_picture?: string;

  @IsOptional()
  business_document?: string;
}
