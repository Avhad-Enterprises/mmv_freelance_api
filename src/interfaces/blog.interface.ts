export interface Blog {
  blog_id: number;
  title: string;
  slug: string;
  featured_image?: string;
  content?: string;
  short_description?: string;
  author_name: string;
  category?: string;
  is_featured: boolean;
  views: number;
  seo_title?: string;
  seo_description?: string;
  reading_time: number;
  comment_count: number;
  scheduled_at?: Date;
  sub_section?: Record<string, any>;
  tags?: Record<string, any>;
  notes?: Record<string, any>;
  is_active: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  updated_by?: number;
  is_deleted: boolean;
  deleted_by?: number;
  deleted_at?: Date;
}