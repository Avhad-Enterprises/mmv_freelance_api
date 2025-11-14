// Videographer Registration DTO
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsEnum, IsNotEmpty, IsBoolean, ValidateIf, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

// Custom validator to ensure boolean is true
function IsTrue(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTrue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value === true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be true`;
        },
      },
    });
  };
}

const AVAILABILITY_OPTIONS = ['part-time', 'full-time', 'flexible', 'on-demand'] as const;
const ID_TYPE_OPTIONS = ['passport', 'driving_license', 'national_id'] as const;

export class VideographerRegistrationDto {
  // Step 1: Basic Information (Required)
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

  @IsOptional()
  @IsString()
  bio?: string;

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
  pincode?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

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

  // Terms and Conditions (Required)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  @IsTrue({ message: 'You must accept the terms and conditions' })
  terms_accepted: boolean;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean()
  @IsTrue({ message: 'You must accept the privacy policy' })
  privacy_policy_accepted: boolean;

  // Note: File uploads (profile_photo, id_document) are handled separately by multer
  // and validated in the service layer, not in the DTO
}
