// Videographer Registration DTO
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

const AVAILABILITY_OPTIONS = ['part-time', 'full-time', 'flexible', 'on-demand'] as const;
const ID_TYPE_OPTIONS = ['passport', 'driving_license', 'national_id'] as const;

export class VideographerRegistrationDto {
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

  // Step 2: Professional Information (Required)
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
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsString()
  full_address?: string;

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

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsNumber()
  rate_amount?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  })
  @IsString()
  rate_currency?: string;

  // Step 3: Verification & Documents (Required)
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['passport', 'driving_license', 'national_id'], { message: 'ID type must be passport, driving_license, or national_id' })
  id_type: string;

  @IsNotEmpty()
  short_description: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().replace(/\s+/g, '-');
    }
    return value;
  })
  @IsString()
  availability?: string;

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
