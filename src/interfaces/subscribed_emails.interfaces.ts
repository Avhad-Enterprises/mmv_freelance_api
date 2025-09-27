// subscribed_emails.interface.ts

export interface SubscribedEmail {
    id: number;
    email: string;
    subscribed_at: Date;
    is_active: number; // 0 or 1
  }
  