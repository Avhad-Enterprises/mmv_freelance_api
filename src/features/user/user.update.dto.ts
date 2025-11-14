// Base User Update DTO - For updating common user fields
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsUrl, 
  IsBoolean,
  MinLength,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating base user information (users table fields only)
 * All fields are optional - only provided fields will be updated
 */
export class UserUpdateDto {
  // Identity
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Contact
  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  // Profile
  @IsOptional()
  @IsUrl()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // Address
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  // Notifications
  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;
}

/**
 * DTO for password change
 */
export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  old_password: string;

  @IsString()
  @MinLength(6)
  new_password: string;
}

/**
 * DTO for password reset request
 */
export class PasswordResetRequestDto {
  @IsEmail()
  email: string;
}

/**
 * DTO for password reset
 */
export class PasswordResetDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
