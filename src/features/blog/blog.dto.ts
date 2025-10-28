import {
  IsString, IsNotEmpty, IsDateString,
  IsInt, IsArray, IsUrl, IsObject,
  IsBoolean, IsOptional, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class BlogDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  blog_id?: number;

  @IsOptional()
  @IsInt()
  author_id?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  featured_image?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsString()
  author_name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  views?: number;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reading_time?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  comment_count?: number;

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  @IsArray()
  sub_section?: [];

  @IsOptional()
  @IsArray()
  tags?: [];

  @IsOptional()
  @IsArray()
  notes?: [];

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsInt()
  created_by?: number;

  @IsOptional()
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deleted_by?: number;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'published';

  @IsOptional()
  @IsString()
  format?: string;
}
