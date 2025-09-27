export interface ITicketReply {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: 'client' | 'freelancer' | 'admin';
  message: string;
  created_at: string;
}
