// Client Registration DTO
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsUrl, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ClientRegistrationDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @Transform(({ value }) => value ? JSON.parse(value) : [])
  @IsArray()
  required_services?: string[];

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  budget_min?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  budget_max?: number;

  @IsOptional()
  @IsString()
  address_line_first?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
