import {
  IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength
} from 'class-validator';

export class ContactSubmissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}

export class ContactSubmissionResponseDto {
  @IsString()
  @IsNotEmpty()
  contact_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  created_at: string;
}