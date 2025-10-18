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

// DTO for creating/updating favorites (includes all fields)
export class favoritesDto {
  @IsInt()
  @IsOptional({ groups: ['create'] })
  id?: number;

  @IsInt()
  @IsOptional() // Made optional since it's provided by auth middleware
  user_id?: number;

  @IsInt()
  freelancer_id: number;

  @IsInt()
  @IsOptional()
  created_by?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  updated_by?: number;

}

// DTO for request body (only fields that come from request)
export class CreateFavoriteDto {
  @IsInt()
  freelancer_id: number;
}

// DTO for removing favorites (only freelancer_id from request)
export class RemoveFavoriteDto {
  @IsInt()
  freelancer_id: number;
}
