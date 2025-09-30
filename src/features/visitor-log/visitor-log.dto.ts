import { IsOptional, IsString, IsNumber, IsIP, IsInt, IsBoolean } from 'class-validator';

export class VisitorLogDto {
  @IsString()
  session_id: string;

  @IsString()
  current_url: string;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsIP()
  ip_address?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;

  @IsOptional()
  @IsString()
  browser_info?: string;

  @IsOptional()
  @IsString()
  os_info?: string;

  @IsOptional()
  @IsString()
  device_type?: string;

  @IsOptional()
  @IsString()
  device_model?: string;

  @IsOptional()
  @IsString()
  screen_resolution?: string;

  @IsOptional()
  @IsString()
  browser_language?: string;

  @IsOptional()
  @IsString()
  referrer_url?: string;

  @IsOptional()
  @IsString()
  referrer_domain?: string;

  // Only include if these exist in your DB table
  @IsOptional()
  @IsString()
  entry_page?: string;

  @IsOptional()
  @IsString()
  exit_page?: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsInt()
  created_by?: number;
}
