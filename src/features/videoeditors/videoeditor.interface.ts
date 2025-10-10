// Video Editor Profile Interface
export interface VideoEditorProfile {
  freelancer_id?: number;
  user_id: number;

  // Professional Info
  profile_title: string;
  role?: string;
  short_description?: string;
  experience_level?: 'entry' | 'intermediate' | 'expert' | 'master';

  // Skills & Expertise
  skills?: string[];
  superpowers?: string[];
  skill_tags?: string[];
  base_skills?: string[];
  languages?: string[];

  // Portfolio & Credentials
  portfolio_links?: string[];
  certification?: any;
  education?: any;
  previous_works?: any;
  services?: any;

  // Pricing & Availability
  rate_amount?: number;
  currency?: string;
  availability?: 'part-time' | 'full-time' | 'flexible' | 'on-demand';
  work_type?: 'remote' | 'on_site' | 'hybrid';
  hours_per_week?: string;

  // Verification
  id_type?: string;
  id_document_url?: string;
  kyc_verified?: boolean;
  aadhaar_verification?: boolean;

  // Stats & Performance
  hire_count?: number;
  review_id?: number;
  total_earnings?: number;
  time_spent?: number;

  // Projects
  projects_applied?: any[];
  projects_completed?: any[];

  // Payment
  payment_method?: any;
  bank_account_info?: any;

  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}

// Video Editor Registration Data Interface
export interface VideoEditorRegistrationData {
  // Step 1: Basic Information (Required)
  full_name: string;
  email: string;
  password: string;

  // Step 2: Skills & Portfolio (Required)
  skill_tags: string[];
  superpowers: string[];
  portfolio_links: string[];
  rate_amount: number;

  // Step 3: Contact & Verification (Required)
  phone_number: string;
  id_type: string;

  // Step 4: Professional Details (Required)
  short_description: string;
  availability: 'part-time' | 'full-time' | 'flexible' | 'on-demand';
  languages: string[];

  // Optional Fields
  experience_level?: string;
  city?: string;
  country?: string;
  pincode?: string;
  role?: string;
  base_skills?: string[];

  // File uploads (required)
  profile_photo: string;
  id_document: string;
}