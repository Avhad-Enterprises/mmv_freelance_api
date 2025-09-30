export interface INotification {
  id?: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  related_id?: number;
  related_type?: string;
  redirect_url?: string;
  is_read?: number;
  read_at?: string | Date;
 
}