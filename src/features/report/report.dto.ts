import {
    IsNotEmpty,
    IsOptional,
    IsIn,
    IsInt,
    IsString,
    IsEmail,
    IsBoolean,
    IsJSON
} from 'class-validator';

export class ReportDto {
    @IsOptional()
    @IsInt()
    report_id?: number;
    @IsIn(['user', 'project'])
    report_type: 'user' | 'project';

    @IsInt()
    reporter_id: number;

    @IsOptional()
    @IsInt()
    reported_project_id?: number;

    @IsOptional()
    @IsJSON()
    tags?: object;

    @IsNotEmpty()
    @IsString()
    notes: string;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsEmail()
    email: string;

    @IsInt()
    created_by: number;

    @IsOptional()
    @IsIn(['reviewed', 'resolved', 'rejected'])
    status?: 'reviewed' | 'resolved' | 'rejected';

    @IsOptional()
    @IsString()
    admin_remarks?: string;

    @IsOptional()
    @IsInt()
    reviewed_by?: number;

    @IsOptional()
    @IsInt()
    updated_by?: number;

}
