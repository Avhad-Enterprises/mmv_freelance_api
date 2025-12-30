import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
} from "class-validator";

export class TagsDto {
  @IsOptional()
  @IsInt()
  tag_id?: number;

  @IsString()
  tag_name: string;

  @IsString()
  tag_value: string;

  @IsString()
  tag_type: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsInt()
  created_by?: number;

  @IsOptional()
  @IsDate()
  created_at?: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @IsInt()
  deleted_by?: number;

  @IsOptional()
  @IsDate()
  deleted_at?: Date;
}
