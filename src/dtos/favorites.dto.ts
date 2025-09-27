import {
  IsEnum,
  IsInt,
  ValidateIf,
  IsOptional,
  IsNumber,
  IsBoolean
} from 'class-validator';

// Enum for favorite types
export enum FavoriteType {
  PROJECT = 'project',
  FREELANCER = 'freelancer',
}

export class favoritesDto {
  @IsInt()
  @IsOptional({ groups: ['create'] })
  id?: number;

  @IsInt()
  user_id: number;

  @IsInt()
  freelancer_id: number;

  @IsInt()
  @IsOptional()
  created_by: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsInt()
  updated_by?: number;

}
