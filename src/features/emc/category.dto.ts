import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  IsDateString 
} from 'class-validator';
import { Type } from 'class-transformer';

enum CategoryType {
  EDITOR = 'editor',
  VIDEOGRAPHER = 'videographer'
}

export class CategorySelectionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @IsString()
  @IsNotEmpty()
  category_name: string;

  @IsEnum(CategoryType)
  @IsNotEmpty()
  category_type: CategoryType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deleted_by?: number;

  @IsOptional()
  @IsDateString()
  deleted_at?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  created_by?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}