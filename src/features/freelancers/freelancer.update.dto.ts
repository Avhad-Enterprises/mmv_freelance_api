// Freelancer Update DTO - For updating freelancer profiles (common fields)
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsUrl, 
  IsEnum, 
  IsNumber, 
  IsBoolean,
  Min, 
  Max,
  IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating freelancer profile information
 * Used by both videographers and video editors
 * All fields are optional - only provided fields will be updated
 */
export class FreelancerUpdateDto {
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

  // Professional Info
  @IsOptional()
  @IsString()
  profile_title?: string;

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
  @Min(1)
  @Max(10000)
  hourly_rate?: number;

  @IsOptional()
  @IsEnum(['full_time', 'part_time', 'flexible', 'on_demand'])
  availability?: string;

  @IsOptional()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_type?: string;

  @IsOptional()
  @IsEnum(['less_than_20', '20_30', '30_40', 'more_than_40'])
  hours_per_week?: string;

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

  // Verification (admin only)
  @IsOptional()
  @IsString()
  id_type?: string;

  @IsOptional()
  @IsUrl()
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
