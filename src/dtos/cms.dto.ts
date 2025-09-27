import {
  IsString, IsNotEmpty, IsDateString,
  IsInt, IsArray, IsUrl, IsObject,
  IsBoolean, IsOptional, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CmsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cms_id?: number;

  @IsOptional()
  @IsString()
  image?: string; // comma-separated: "img1.jpg,img2.jpg"

  @IsOptional()
  @IsString()
  carousel?: string; // comma-separated: "slide1.jpg,slide2.jpg"

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  link_1?: string;

  @IsOptional()
  @IsString()
  link_2?: string;

  @IsOptional()
  @IsString()
  link_3?: string;

  @IsOptional()
  @IsArray()
  category?: any[]; // stored as JSONB array

  @IsOptional()
  @IsArray()
  faq?: any[]; // stored as JSONB array

  @IsOptional()
  @IsArray()
  blog?: any[]; // stored as JSONB array

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  created_by: number;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

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

  @IsOptional()
  @IsDateString()
  deleted_at?: string;
}
