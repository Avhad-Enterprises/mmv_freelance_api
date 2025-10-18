import {
    IsString,
    IsOptional,
    IsInt,
    IsBoolean,
    IsDate,
    IsNotEmpty,
    MinLength,
} from "class-validator";

export class SkillsDto {
    @IsOptional()
    @IsInt()
    skill_id?: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    skill_name: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsInt()
    created_by: number;

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