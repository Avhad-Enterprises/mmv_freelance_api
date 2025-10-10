// Client Profile Interface
export interface ClientProfile {
  client_freelancer_id?: number;
  user_id: number;

  // Company Information
  company_name?: string;
  website?: string;
  company_description?: string;
  industry?: string;
  company_size?: string;

  // Location Information
  country?: string;
  state?: string;
  city?: string;
  address?: string;

  // Project Information
  project_title?: string;
  project_description?: string;
  project_category?: string;
  project_budget?: number;
  project_timeline?: string;

  // Terms and Privacy
  terms_accepted?: boolean;
  privacy_policy_accepted?: boolean;

  // Business Details
  tax_id?: string;
  business_documents?: string[];
  id_document_url?: string;
  business_document_url?: string;

  // Work Preferences (legacy fields - may be deprecated)
  work_arrangement?: string;
  project_frequency?: string;
  hiring_preferences?: string;
  expected_start_date?: string;
  project_duration?: string;

  // Stats
  projects_created?: any[];
  total_spent?: number;

  // Payment
  payment_method?: any;

  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}
