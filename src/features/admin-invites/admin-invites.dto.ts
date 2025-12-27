// src/features/admin-invites/dto/admin-invites.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
} from "class-validator";

export class CreateAdminInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class AdminInviteResponseDto {
  invitation_id: number;
  email: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export class VerifyTokenResponseDto {
  email: string;
  expires_at: string;
}

export class CompleteRegistrationDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @MinLength(8)
  confirm_password: string;
}

// Deprecated - kept for backward compatibility
export class AcceptInviteDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @MinLength(8)
  new_password?: string;
}
