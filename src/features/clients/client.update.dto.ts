// Client Update DTO - For updating client profiles
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsUrl, 
  IsEnum, 
  IsNumber, 
  Min, 
  Max,
  IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating client profile information
 * All fields are optional - only provided fields will be updated
 */
export class ClientUpdateDto {
  // Basic Info
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsUrl()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

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
      return JSON.parse(value);
    }
    return value;
  })
  social_links?: object;

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

  // Address
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
  business_documents?: string[];

  // Preferences
  @IsOptional()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_arrangement?: string;

  @IsOptional()
  @IsEnum(['one_time', 'recurring', 'long_term', 'ongoing'])
  project_frequency?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  hiring_preferences?: object;

  @IsOptional()
  @IsString()
  expected_start_date?: string;

  @IsOptional()
  @IsEnum(['less_than_1_month', '1_3_months', '3_6_months', '6_months_plus'])
  project_duration?: string;

  // Payment
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  payment_method?: object;
}
