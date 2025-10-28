export interface ContactSubmission {
  contact_id?: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  ip_address?: string;
  user_agent?: string;
  status?: 'pending' | 'responded' | 'closed';
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  responded_at?: string;
  closed_at?: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  data?: ContactSubmission;
  errors?: Record<string, string>;
}

export interface ContactSubmissionCreateData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  ip_address?: string;
  user_agent?: string;
}