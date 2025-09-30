import {
    IsInt,
    IsNotEmpty,
} from 'class-validator';

export class ApproveProjectDto {
    
    @IsInt()
    @IsNotEmpty()
    submission_id: number;

    @IsInt()
    @IsNotEmpty()
    status: number;
} 