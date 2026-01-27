import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCareerDto {
    @IsString()
    @IsNotEmpty()
    public title: string;

    @IsString()
    @IsNotEmpty()
    public short_description: string;

    @IsString()
    @IsNotEmpty()
    public office_location: string;

    @IsString()
    @IsOptional()
    public detail_description: string;

    @IsString()
    @IsOptional()
    public job_details: string;

    @IsString()
    @IsNotEmpty()
    public apply_link: string;

    @IsString()
    @IsOptional()
    public company_logo: string;

    @IsBoolean()
    @IsOptional()
    public is_active: boolean;
}

export class UpdateCareerDto {
    @IsString()
    @IsOptional()
    public title: string;

    @IsString()
    @IsOptional()
    public short_description: string;

    @IsString()
    @IsOptional()
    public office_location: string;

    @IsString()
    @IsOptional()
    public detail_description: string;

    @IsString()
    @IsOptional()
    public job_details: string;

    @IsString()
    @IsOptional()
    public apply_link: string;

    @IsString()
    @IsOptional()
    public company_logo: string;

    @IsBoolean()
    @IsOptional()
    public is_active: boolean;
}
