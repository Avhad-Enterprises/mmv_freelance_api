// Client Registration DTO
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsEnum, IsNotEmpty, MinLength, Min, Max, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class ClientRegistrationDto {
  // Step 1: Basic Information (Required)
  @IsOptional()
  @IsString()
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

  // Step 2: Company & Requirements (Required)
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsNotEmpty()
  @IsEnum(['film', 'ad_agency', 'events', 'youtube', 'corporate', 'other'])
  industry: string;

  @IsNotEmpty()
  @IsEnum(['1-10', '11-50', '51-200', '200+'])
  company_size: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsNotEmpty()
  @IsArray()
  required_services: string[];

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsNotEmpty()
  @IsArray()
  required_skills: string[];

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsNotEmpty()
  @IsArray()
  required_editor_proficiencies: string[];

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsNotEmpty()
  @IsArray()
  required_videographer_proficiencies: string[];

  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @Min(0)
  budget_min: number;

  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @Min(0)
  budget_max: number;

  // Step 3: Contact & Location (Required)
  @IsNotEmpty()
  @IsString()
  @Length(10, 10)
  phone_number: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  @Length(5, 6)
  pincode: string;

  @IsOptional()
  @IsString()
  business_document?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  // Step 4: Work Preferences (Required)
  @IsNotEmpty()
  @IsEnum(['remote', 'on_site', 'hybrid'])
  work_arrangement: string;

  @IsNotEmpty()
  @IsEnum(['one_time', 'occasional', 'ongoing'])
  project_frequency: string;

  @IsNotEmpty()
  @IsEnum(['individuals', 'agencies', 'both'])
  hiring_preferences: string;

  @IsOptional()
  @IsString()
  expected_start_date?: string;

  @IsOptional()
  @IsEnum(['less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_plus_months'])
  project_duration?: string;
}
