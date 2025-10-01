import { 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsArray, 
  IsNumber, 
  IsEnum, 
  MinLength, 
  IsNotEmpty,
  Min,
  Max,
  ArrayMinSize,
  IsUrl
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UserRegistrationDto {
  // Step 1: Basic Information
  @IsOptional() // Made optional as frontend can derive from full_name
  @IsString()
  @MinLength(3)
  username?: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(['freelancer', 'client'])
  account_type: 'freelancer' | 'client';

  // Freelancer-specific fields (NEW PHASE 1 FIELDS)
  @IsOptional()
  @IsString()
  role?: string; // New field from frontend

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  superpowers?: string[]; // New field from frontend

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  skill_tags?: string[]; // New field from frontend

  @IsOptional()
  @IsString()
  short_description?: string; // New field from frontend

  // Existing freelancer fields with updates
  @IsOptional()
  @IsString()
  profile_title?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  skills?: string[]; // Maps from base_skills in frontend

  @IsOptional()
  @IsEnum(['entry', 'intermediate', 'expert', 'master'])
  experience_level?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value]; // Single URL becomes array
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  portfolio_links?: string[]; // Updated to handle multiple URLs

  @IsOptional()
  @Transform(({ value }) => {
    // Handle both string and number inputs from rate_amount
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return typeof value === 'number' ? value : undefined;
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  hourly_rate?: number; // Maps from rate_amount in frontend

  // Step 3: Contact & Location (Required for both but field names differ)
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Remove all non-numeric characters except + for country code
      const cleanPhone = value.replace(/[^\d+]/g, '');
      return cleanPhone;
    }
    return value;
  })
  phone_number?: string;

  // Freelancer address fields
  @IsOptional()
  @IsString()
  street_address?: string; // Can contain "lat,lng" coordinates

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zip_code?: string; // Maps to pincode in database

  @IsOptional()
  @IsEnum(['passport', 'driving_license', 'national_id'])
  id_type?: string;

  // Step 4: Work Preferences (Freelancer)
  @IsOptional()
  @IsEnum(['full_time', 'part_time', 'flexible', 'on_demand'])
  availability?: string;

  @IsOptional()
  @IsEnum(['less_than_20', '20_30', '30_40', 'more_than_40'])
  hours_per_week?: string;

  @IsOptional()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_type?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  languages?: string[];

  // Client-specific fields (Step 2)
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsEnum(['film', 'ad_agency', 'events', 'youtube', 'corporate', 'other'])
  industry?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  social_links?: string;

  @IsOptional()
  @IsEnum(['1-10', '11-50', '51-200', '200+'])
  company_size?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  required_services?: string[]; // Default: ["General Services"] if missing

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  required_skills?: string[]; // Default: ["General Skills"] if missing

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  required_editor_proficiencies?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  required_videographer_proficiencies?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return typeof value === 'number' ? value : undefined;
  })
  @IsNumber()
  @Min(0)
  budget_min?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return typeof value === 'number' ? value : undefined;
  })
  @IsNumber()
  @Min(0)
  budget_max?: number;

  // Step 3: Contact & Business Details (Client)
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  // Step 4: Work Preferences (Client)
  @IsOptional()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_arrangement?: string;

  @IsOptional()
  @IsEnum(['one_time', 'occasional', 'ongoing'])
  project_frequency?: string;

  @IsOptional()
  @IsEnum(['individuals', 'agencies', 'both'])
  hiring_preferences?: string;

  @IsOptional()
  @IsString()
  expected_start_date?: string;

  @IsOptional()
  @IsEnum(['less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_plus_months'])
  project_duration?: string;
}

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  email: string; // Can be email or username

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}