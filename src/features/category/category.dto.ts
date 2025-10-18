import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  isInt
} from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryDto {
  @IsOptional({ groups: ['update'] })
  @IsInt({ groups: ['update'] })
  category_id: number;
  
  @IsString()
  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update'] })
  category_name: string;

  @IsString()
  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update'] })
  category_type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  created_by: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deleted_by?: number;
}