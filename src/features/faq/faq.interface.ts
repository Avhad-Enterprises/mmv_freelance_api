export interface IFaq {
  faq_id?: number;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
  tags?: string[];
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  deleted_at?: string;
  is_deleted?: boolean;
}
