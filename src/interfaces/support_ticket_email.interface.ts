export interface IEmailLog {
  id: number;
  ticket_id: number;
  to_email: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  sent_at: string;
}
