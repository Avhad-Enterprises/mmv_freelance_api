import{
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsDateString,
    isInt,
} from 'class-validator';

export class SubmitProjectDto{
    
    @IsOptional({ groups: ['create'] })
    @IsInt({ groups: ['update'] })
    submission_id?: number;

    @IsInt({ groups: ['create' ,'update'] })
    projects_task_id: number;

    @IsInt({ groups: ['create' ,'update'] })
    user_id : number;

    @IsString()
    submitted_files: string;

    @IsOptional()
    @IsString()
    additional_notes : string;

    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    status?: number;

    @IsOptional({ groups: ['create', 'update'] })
    @IsBoolean({ groups: ['create', 'update'] })
    is_active?: boolean;

    @IsOptional({ groups: ['create', 'update'] })
    @IsBoolean({ groups: ['create', 'update'] })
    is_deleted?: boolean;

    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    deleted_by?: number;

    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    created_by?: number;

    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    updated_by?: number;

    @IsOptional()
    @IsDateString()
    created_at?: string;

    @IsOptional()
    @IsDateString()
    updated_at?: string;
}
