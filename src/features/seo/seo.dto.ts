// dto/seo.dto.ts
import {
    IsString,
    IsOptional,
    IsInt,
    IsBoolean,
    IsDate,
    IsNotEmpty,
    MinLength,
} from 'class-validator';

export class SeoDto {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    meta_title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    meta_description: string;

    @IsOptional()
    @IsString()
    canonical_url?: string;

    @IsOptional()
    @IsString()
    og_title?: string;

    @IsOptional()
    @IsString()
    og_description?: string;

    @IsOptional()
    @IsString()
    og_image_url?: string;

    @IsOptional()
    @IsString()
    og_site_name?: string;

    @IsOptional()
    @IsString()
    og_locale?: string;

    @IsOptional()
    @IsString()
    twitter_card?: string;

    @IsOptional()
    @IsString()
    twitter_title?: string;

    @IsOptional()
    @IsString()
    twitter_image_url?: string;

    @IsOptional()
    @IsString()
    twitter_description?: string;

    @IsOptional()
    @IsString()
    twitter_site?: string;

    @IsOptional()
    @IsString()
    twitter_creator?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;

    @IsOptional()
    @IsDate()
    created_at?: Date;

    @IsOptional()
    @IsDate()
    updated_at?: Date;
}

export class UpdateSeoDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    meta_title?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    meta_description?: string;

    @IsOptional()
    @IsString()
    canonical_url?: string;

    @IsOptional()
    @IsString()
    og_title?: string;

    @IsOptional()
    @IsString()
    og_description?: string;

    @IsOptional()
    @IsString()
    og_image_url?: string;

    @IsOptional()
    @IsString()
    og_site_name?: string;

    @IsOptional()
    @IsString()
    og_locale?: string;

    @IsOptional()
    @IsString()
    twitter_card?: string;

    @IsOptional()
    @IsString()
    twitter_title?: string;

    @IsOptional()
    @IsString()
    twitter_image_url?: string;

    @IsOptional()
    @IsString()
    twitter_description?: string;

    @IsOptional()
    @IsString()
    twitter_site?: string;

    @IsOptional()
    @IsString()
    twitter_creator?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
