import { IsEmail, IsOptional, IsString, IsBoolean, IsArray, IsNumber, IsInt, IsObject, IsEnum } from 'class-validator';


export class UsersDto {
  @IsOptional()
  @IsInt()
  user_id: number;

  @IsString()
  full_name: string;

  @IsString()
  username: string;

  @IsString()
  phone_number: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  profile_picture: string;

  @IsString()
  profile_title: string;

  @IsOptional()
  @IsArray()
  skill: any[];

  @IsOptional()
  @IsArray()
  category_services: any[];

  @IsEnum(['Beginner', 'Intermediate', 'Expert'])
  experience_level: string;

  @IsOptional()
  @IsArray()
  portfolio_links: string[];

  @IsOptional()
  @IsNumber()
  hourly_rate: number;

  @IsOptional()
  @IsNumber()
  project_rate: number;

  @IsOptional()
  @IsString()
  currency: string;

  @IsEnum(['Part-time', 'Full-time', 'Flexible', 'On-Demand'])
  availability: string;

  @IsEnum(['Remote Only', 'On-Site', 'Hybrid'])
  work_type: string;

  @IsOptional()
  @IsArray()
  languages_spoken: string[];

  @IsOptional()
  @IsEnum(['Aadhaar', 'PAN', 'Passport', 'Driving Licence', 'Voter ID', 'Other'])
  id_type: string;

  @IsOptional()
  @IsString()
  id_document_url: string;

  @IsOptional()
  @IsInt()
  hours_per_week: number;

  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  industry: string;

  @IsOptional()
  @IsArray()
  website_links: string[];

  @IsOptional()
  @IsEnum(['1-10', '11-50', '51-200', '200+'])
  company_size: string;

  @IsOptional()
  @IsArray()
  services_required: string[];

  @IsOptional()
  @IsNumber()
  avg_budget_min: number;

  @IsOptional()
  @IsNumber()
  avg_budget_max: number;

  @IsOptional()
  @IsString()
  budget_currency: string;

  @IsOptional()
  @IsEnum(['Remote', 'On-site', 'Hybrid'])
  preferred_work_arrangement: string;

  @IsOptional()
  @IsEnum(['One-time', 'Occasional', 'Ongoing'])
  project_frequency: string;

  @IsOptional()
  @IsEnum(['Individuals', 'Agencies', 'Both'])
  hiring_preferences: string;

  @IsOptional()
  @IsString()
  otp_code: string;

  @IsOptional()
  @IsBoolean()
  phone_verified: boolean;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  pincode: string;

  @IsOptional()
  @IsNumber()
  latitude: number;

  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsBoolean()
  aadhaar_verification: boolean;

  @IsOptional()
  @IsBoolean()
  email_verified: boolean;

  @IsOptional()
  @IsString()
  reset_token: string;

  @IsOptional()
  @IsString()
  reset_token_expires: string;

  @IsOptional()
  @IsString()
  login_attempts: string;

  @IsOptional()
  @IsBoolean()
  kyc_verified: boolean;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  banned_reason: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsBoolean()
  email_notifications: boolean;

  @IsOptional()
  @IsArray()
  tags: string[];

  @IsOptional()
  @IsArray()
  notes: string[];

  @IsOptional()
  @IsArray()
  certification: string[];

  @IsOptional()
  @IsArray()
  education: string[];

  @IsOptional()
  @IsArray()
  services: string[];

  @IsOptional()
  @IsArray()
  previous_works: string[];

  @IsOptional()
  @IsArray()
  projects_created: string[];

  @IsOptional()
  @IsArray()
  projects_applied: string[];

  @IsOptional()
  @IsArray()
  projects_completed: string[];

  @IsOptional()
  @IsInt()
  hire_count: number;

  @IsOptional()
  @IsInt()
  review_id: number;

  @IsOptional()
  @IsInt()
  total_earnings: number;

  @IsOptional()
  @IsInt()
  total_spent: number;

  @IsOptional()
  @IsArray()
  payment_method: any[];

  @IsOptional()
  @IsArray()
  bank_account_info: any[];

  @IsOptional()
  @IsString()
  account_type: string;

  @IsOptional()
  @IsInt()
  time_spent: number;

  @IsOptional()
  @IsString()
  account_status: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsBoolean()
  is_banned: boolean;

  @IsOptional()
  @IsBoolean()
  is_deleted: boolean;

  @IsOptional()
  @IsString()
  created_at: string;

  @IsOptional()
  @IsString()
  updated_at: string;

  @IsOptional()
  @IsInt()
  updated_by: number;

  @IsOptional()
  @IsString()
  last_login_at: string;
}

export class ArtworkSelectionDto {
  @IsString()
  account_status: string;


  @IsBoolean()
  is_active: boolean;


  @IsBoolean()
  is_banned: boolean;


  @IsOptional()
  created_at?: Date;


  @IsOptional()
  updated_at?: Date;


  @IsOptional()
  updated_by?: Date;

  @IsOptional({ groups: ['create', 'update'] })
  @IsBoolean({ groups: ['create', 'update'] })
  is_deleted?: boolean;

  @IsOptional()
  last_login_at?: Date;
}