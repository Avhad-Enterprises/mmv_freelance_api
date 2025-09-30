

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id?: number;
  user_id: number;
  client_id?: number;
  project_id?: number;
  ticket_category: string;
  title: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
  assigned_agent_id?: number;
  project_asign_date?: Date;
  response_time?: string;
  resolution_date?: Date;
  communication_logs?: Record<string, any>;
  resolution_notes?: string;
  satisfaction_rating?: number;
  feedback_comment?: string;
  payment_type?: string;
  platform_used?: string;
  support_language?: string;
  email?: string;
  location?: string;
  ip_address?: string;
  os_info?: string;
  browser_info?: string;
  status?: TicketStatus;
  created_by?: number;
  updated_by?: number;
  is_deleted?: boolean;
  deleted_by?: number;
created_at?: Date | any;
updated_at?: Date | any;

}
