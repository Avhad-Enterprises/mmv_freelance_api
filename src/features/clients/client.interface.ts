// Client Profile Interface
export interface ClientProfile {
  client_profile_id?: number;
  user_id: number;
  company_name?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  tax_id?: string;
  business_address?: string;
  business_city?: string;
  business_state?: string;
  business_country?: string;
  business_postal_code?: string;
  required_services?: string[];
  budget_min?: number;
  budget_max?: number;
  preferred_communication?: string;
  project_requirements?: string;
  payment_terms?: string;
  business_documents?: string[];
  created_at?: Date;
  updated_at?: Date;
}
