import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsJSON,
  IsArray,
  ArrayNotEmpty,
  IsUrl,
  IsObject,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ProjectsTaskDto {
  @IsInt()
  client_id: number;

  @IsInt()
  @IsOptional()
  freelancer_id: number;

  @IsString()
  project_title: string;

  @IsOptional()
  @IsString()
  project_category: string;

  @IsDateString()
  deadline: string;

  @IsString()
  project_description: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsJSON()
  tags?: any;

  @IsArray()
  @IsString({ each: true })
  skills_required: string[];

  @IsArray()
  @IsString({ each: true })
  reference_links: string[];

  @IsString()
  additional_notes: string;

  @IsOptional({ groups: ["create", "update"] })
  @IsInt({ groups: ["create", "update"] })
  status?: number;

  @IsOptional()
  @IsString()
  projects_type: string;

  @IsString()
  project_format: string;

  @IsString()
  audio_voiceover: string;

  @IsString()
  audio_description: string;

  @IsInt()
  video_length: number;

  @IsString()
  preferred_video_style: string;

  @IsArray()
  @IsOptional()
  sample_project_file: string[];

  @IsArray()
  @IsOptional()
  project_files: string[];

  @IsArray()
  @IsOptional()
  show_all_files: string[];

  @IsString()
  url: string;

  @IsString()
  meta_title: string;

  @IsString()
  meta_description: string;

  @IsInt()
  is_active: number;

  @IsOptional()
  @IsBoolean()
  bidding_enabled?: boolean;

  @IsInt()
  created_by: number;

  @IsOptional()
  @IsDateString()
  assigned_at?: string;

  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @IsOptional()
  @IsInt()
  application_count?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  shortlisted_freelancer_ids?: number[];
}
