import {
  IsString, IsNotEmpty, IsDateString,
  IsInt, IsArray, IsUrl, IsObject,
  IsBoolean, IsOptional, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  permission_id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_critical?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;
}