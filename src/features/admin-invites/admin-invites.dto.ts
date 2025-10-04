// src/features/admin-invites/dto/admin-invites.dto.ts

import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, MinLength } from 'class-validator';

export class CreateAdminInviteDto {
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()
    @IsString()
    last_name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    assigned_role?: string; // Role name like 'ADMIN', 'CLIENT', etc.

    @IsOptional()
    @MinLength(8)
    password?: string; // Optional temporary password
}

export class AdminInviteResponseDto {
    invitation_id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: 'pending' | 'accepted' | 'revoked' | 'expired';
    assigned_role: string | null;
    invited_by: number;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export class AcceptInviteDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsOptional()
    @MinLength(8)
    new_password?: string; // If user wants to change the temporary password
}