export interface ICms {
  cms_id?: number;
  image?: string;
  title: string;
  description?: string;
  link_1?: string;
  link_2?: string;
  link_3?: string;
  faq?: Record<string, any>;
  blog?: any;
  type?: string;
  is_active?: number;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: number;
  is_deleted?: boolean;
  deleted_by?: number;
  deleted_at?: string;
}