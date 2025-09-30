export interface BrandingAssets {
    id?: number; // Optional for creation
    navbar_logo?: string | null;
    navbar_logo_mobile?: string | null;
    footer_logo?: string | null;
    favicon?: string | null;
    is_active?: number; // 0 or 1
    created_by: number;
    created_at?: Date;
    updated_at?: Date;
    updated_by?: number | null;
    is_deleted?: boolean;
    deleted_by?: number | null;
    deleted_at?: Date | null;
  }
  