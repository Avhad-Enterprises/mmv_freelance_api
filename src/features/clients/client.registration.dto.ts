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

  @IsNotEmpty()
  company_description: string;

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

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  zip_code: string;

  // Step 4: Project Information (Required)
  @IsNotEmpty()
  project_title: string;

  @IsNotEmpty()
  project_description: string;

  @IsNotEmpty()
  project_category: string;

  @IsNotEmpty()
  project_budget: number;

  @IsNotEmpty()
  project_timeline: string;

  // Step 5: Additional Information (Required)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  terms_accepted: boolean;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  privacy_policy_accepted: boolean;

  // Optional file uploads
  @IsOptional()
  profile_picture?: string;

  @IsOptional()
  business_document?: string;
}
