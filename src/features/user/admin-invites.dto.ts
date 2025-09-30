import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class InviteDTO {
  @IsOptional()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  invite_token: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  invited_by?: number;


}
