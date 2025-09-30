import { IsEmail, IsOptional, IsString, IsBoolean, IsArray, IsNumber, IsInt, IsObject } from 'class-validator';


export class UsersDto {
  @IsOptional({ groups: ["update"] })
  @IsInt({ groups: ["update"] })
  user_id: number;

  // @IsOptional()
  // @IsString()
  // first_name: string;

  // @IsOptional()
  // @IsString()
  // last_name: string;

  @IsOptional()
  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  profile_picture: string;

  @IsOptional({ groups: ['update', 'create'] })
  @IsString()
  address_line_first: string;

  @IsOptional({ groups: ['update', 'create'] })
  @IsString()
  address_line_second: string;

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
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  aadhaar_verification: boolean;

  @IsOptional()
  @IsBoolean()
  email_verified: boolean;

  @IsOptional()
  @IsBoolean()
  phone_verified: boolean;

  @IsOptional()
  @IsString()
  reset_token: string;

  @IsOptional()
  @IsString()
  reset_token_expires: string;

  @IsOptional()
  @IsInt()
  login_attempts: number;

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
  @IsString()
  timezone: string;

  @IsOptional()
  skill?: JSON;

  @IsOptional()
  @IsBoolean()
  email_notifications: boolean;

  @IsOptional()
  tags: any; // JSONB

  @IsOptional()
  @IsArray()
  notes?: [];

  @IsOptional()
  certification: any; // JSONB

  @IsOptional()
  education: any; // JSONB

  @IsOptional()
  @IsArray()
  experience: any[]; // Updated to accept an array

  @IsOptional()
  @IsArray()
  projects_created: number[]; // Updated to accept an array of integers

  @IsOptional()
  @IsArray()
  projects_applied: number[]; // Updated to accept an array of integers

  @IsOptional()
  @IsArray()
  projects_completed: number[]; // Updated to accept an array of integers

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
  payment_method: any;

  @IsOptional()
  payout_method: any;

  @IsOptional()
  bank_account_info: any;

  @IsOptional()
  @IsString()
  account_type: string;

  @IsOptional()
  @IsString()
  availability: string;

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
  @IsString()
  created_at: string; // Updated to accept ISO date string

  @IsOptional()
  @IsString()
  updated_at: string; // Updated to accept ISO date string

  @IsOptional()
  @IsString()
  last_login_at: string; // Updated to accept ISO date string

  @IsOptional()
  @IsString()
  profile_title: string; // Profile Title

  @IsOptional()
  @IsArray()
  category_of_services: any[]; // Category of Services

  @IsOptional()
  @IsString()
  experience_level: string; // Experience Level (Beginner, Intermediate, Expert)

  @IsOptional()
  @IsArray()
  portfolio_links: any[]; // Portfolio Upload/Links

  @IsOptional()
  @IsNumber()
  hourly_rate: number; // Hourly Rate

  @IsOptional()
  @IsNumber()
  project_rate: number; // Project Rate

  @IsOptional()
  @IsString()
  work_type: string; // Work Type (Remote Only, On-Site, Hybrid)

  @IsOptional()
  @IsArray()
  languages_spoken: any[]; // Languages Spoken

  // Employer-specific fields

  @IsOptional()
  @IsString()
  company_name: string; // Company/Brand Name

  @IsOptional()
  @IsString()
  industry: string; // Industry (Film, Ad Agency, etc.)

  @IsOptional()
  @IsArray()
  website_links: any[]; // Website/Social Links

  @IsOptional()
  @IsString()
  company_size: string; // Company Size (1-10, 11-50, etc.)

  @IsOptional()
  @IsArray()
  services_required: any[]; // Type of Services Required

  @IsOptional()
  @IsString()
  average_project_budget: string; // Average Project Budget Range

  @IsOptional()
  @IsString()
  project_frequency: string; // Project Frequency (One-time, Occasional, Ongoing)

  @IsOptional()
  @IsString()
  hiring_preferences: string; // Hiring Preferences (Individuals, Agencies, Both)

  
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