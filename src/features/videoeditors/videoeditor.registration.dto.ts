// Video Editor Registration DTO
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsEnum, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

const AVAILABILITY_OPTIONS = ['part-time', 'full-time', 'flexible', 'on-demand'] as const;
const ID_TYPE_OPTIONS = ['passport', 'driving_license', 'national_id'] as const;

export class VideoEditorRegistrationDto {
  // Step 1: Basic Information (Required)
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  // Step 2: Skills & Portfolio (Required)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  skill_tags: string[];

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  superpowers: string[];

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  portfolio_links: string[];

  @IsNotEmpty()
  rate_amount: number;

  // Step 3: Contact & Verification (Required)
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ID_TYPE_OPTIONS, { message: 'ID type must be passport, driving_license, or national_id' })
  id_type: string;

  @IsNotEmpty()
  short_description: string;

  @IsNotEmpty()
  @IsEnum(AVAILABILITY_OPTIONS)
  availability: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  languages: string[];

  // Optional Fields
  @IsOptional()
  @IsString()
  @IsEnum(['entry', 'intermediate', 'expert', 'master'])
  experience_level?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  base_skills?: string[];

  // Note: File uploads (profile_photo, id_document) are handled separately by multer
  // and validated in the service layer, not in the DTO
}
