import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn, IsObject } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address_line_first?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsIn(['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'])
  roleName?: string;

  @IsOptional()
  @IsObject()
  profileData?: any;
}

export class AssignRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'])
  roleName: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address_line_first?: string;

  @IsOptional()
  @IsString()
  username?: string;
}