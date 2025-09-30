import {
  IsString, IsNotEmpty, IsDateString,
  IsInt, IsArray, IsUrl, IsObject,
  IsBoolean, IsOptional, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @Type(() => Number)
  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  related_id?: number;

  @IsOptional()
  @IsString()
  related_type?: string;

  @IsOptional()
  @IsString()
  redirect_url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  is_read?: number;

  @IsOptional()
  @IsDateString()
  read_at?: string;

}