import {
  IsString, IsNotEmpty, IsDateString,
  IsInt, IsArray, IsUrl, IsObject,
  IsBoolean, IsOptional, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class FaqDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faq_id?: number;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @IsOptional()
  @IsString()
  type?: string;
}