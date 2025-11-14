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

  // Business Details
  tax_id?: string;
  business_document_urls?: string[];

  // Stats
  projects_created?: any[];
  total_spent?: number;

  // Payment
  payment_method?: any;
  bank_account_info?: any;

  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}
