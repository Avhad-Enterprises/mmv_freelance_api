import { IsOptional, IsString, IsInt, IsBoolean, IsUrl } from 'class-validator';

export class BrandingAssetsDto {
  @IsOptional()
  @IsString()
  navbar_logo?: string;

  @IsOptional()
  @IsString()
  navbar_logo_mobile?: string;

  @IsOptional()
  @IsString()
  footer_logo?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

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
  @IsInt()
  deleted_by?: number;
}
