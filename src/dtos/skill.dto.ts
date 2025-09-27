import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class SkillsDto {
  @IsNotEmpty()
  @IsString()
  skill_name: string;

@IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsNotEmpty()
  @IsInt()
  created_by: number;

  @IsOptional()
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @IsInt()
  deleted_by?: number;
}
