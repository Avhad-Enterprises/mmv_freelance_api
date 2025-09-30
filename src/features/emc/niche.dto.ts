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

enum NicheType {
  EDITOR = 'editor',
  VIDEOGRAPHER = 'videographer'
}

export class NicheSelectionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  niche_id?: number;

  @IsString()
  @IsNotEmpty()
  niche_name: string;

  @IsEnum(NicheType)
  @IsNotEmpty()
  niche_type: NicheType;

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