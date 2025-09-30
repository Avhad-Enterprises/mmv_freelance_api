// interfaces/seo.interface.ts
export interface ISeo {
    id: number;
    meta_title: string;
    meta_description: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image_url?: string;
    og_site_name?: string;
    og_locale?: string;
    twitter_card?: string;
    twitter_title?: string;
    twitter_image_url?: string;
    twitter_description?: string;
    twitter_site?: string;
    twitter_creator?: string;
    status?: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string; // ISO timestamp
    updated_at: string;
  }
  