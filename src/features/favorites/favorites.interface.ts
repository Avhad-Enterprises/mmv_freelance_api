export interface IFavorites {
  id?: number;
  user_id: number;
  type: string;
  target_id: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}