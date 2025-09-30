export interface IPermission {
  permission_id?: number;
  name: string;
  label?: string;
  module?: string;
  description?: string;
  is_critical?: boolean;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: number;
}