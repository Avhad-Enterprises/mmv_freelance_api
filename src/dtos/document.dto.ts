import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Document {
  AADHAAR = 'aadhaar',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  VOTER_ID = 'voter_id',
  PAN_CARD = 'pan_card',
  UTILITY_BILL = 'utility_bill',
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

/** Create DTO */
export class DocumentDto {
  @Type(() => Number)
  @IsInt()
  user_id: number;

  @IsEnum(Document)
  document_type: Document;

  @IsString()
  @IsNotEmpty()
  document_upload: string; // path/filename/URL

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  verified_by?: number;

  @IsOptional()
  @IsDateString()
  verified_at?: string;

  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

export class UpdateDocumentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  document_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsEnum(Document)
  document_type?: Document;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  document_upload?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  verified_by?: number;

  @IsOptional()
  @IsDateString()
  verified_at?: string;

  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
