export interface Users {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  password?: string;
  
  // Address fields
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  
  // Frontend required fields
  profile_title?: string;
  skills?: string[] | string; // Can be array or JSON string
  experience_level?: string;
  portfolio_links?: string[] | string;
  hourly_rate?: number;
  availability?: string;
  hours_per_week?: string;
  work_type?: string;
  languages?: string[] | string;
  
  // Client specific fields
  company_name?: string;
  industry?: string;
  website?: string;
  social_links?: any;
  company_size?: string;
  required_services?: string[] | string;
  required_skills?: string[] | string;
  required_editor_proficiencies?: string[] | string;
  required_videographer_proficiencies?: string[] | string;
  budget_min?: number;
  budget_max?: number;
  
  // Document fields
  id_type?: string;
  id_document?: string; // URL after upload
  tax_id?: string;
  
  // Work preferences
  work_arrangement?: string;
  project_frequency?: string;
  hiring_preferences?: string;
  
  // Verification fields
  aadhaar_verification?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  kyc_verified?: boolean;
  
  // Terms and Privacy
  terms_accepted?: boolean;
  privacy_policy_accepted?: boolean;
  
  // Account fields
  account_type: 'freelancer' | 'client';
  role?: string;
  banned_reason?: string;
  bio?: string;
  email_notifications?: boolean;
  
  // System fields
  tags?: string[] | string;
  notes?: Record<string, any>;
  certification?: Record<string, any>;
  education?: Record<string, any>;
  services?: Record<string, any>;
  previous_works?: Record<string, any>;
  projects_created?: number;
  projects_applied?: number;
  projects_completed?: number;
  hire_count?: number;
  review_id?: number;
  total_earnings?: number;
  total_spent?: number;
  payment_method?: Record<string, any>;
  bank_account_info?: Record<string, any>;
  time_spent?: number;
  account_status?: string;
  is_active?: boolean;
  is_banned?: boolean;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: Date;
  last_login_at?: Date;
  reset_token?: string;
  reset_token_expires?: Date;
  login_attempts?: number;
}