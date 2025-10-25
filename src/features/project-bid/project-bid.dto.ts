import {
    IsNumber,
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    Min,
    Max,
    Length,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBidDto {
    @IsNumber()
    project_id: number;

    @IsNumber()
    @Min(1)
    bid_amount: number;

    @IsNumber()
    @Min(1)
    @Max(365) // Maximum 1 year delivery time
    delivery_time_days: number;

    @IsString()
    @Length(50, 5000)
    proposal: string;

    @IsOptional()
    @IsArray()
    milestones?: any[];

    @IsOptional()
    @IsBoolean()
    is_featured?: boolean;

    @IsOptional()
    additional_services?: any;
}

export class UpdateBidDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    bid_amount?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(365)
    delivery_time_days?: number;

    @IsOptional()
    @IsString()
    @Length(50, 5000)
    proposal?: string;

    @IsOptional()
    @IsArray()
    milestones?: any[];

    @IsOptional()
    @IsBoolean()
    is_featured?: boolean;

    @IsOptional()
    additional_services?: any;
}

export class BidStatusUpdateDto {
    @IsEnum(['pending', 'accepted', 'rejected', 'withdrawn'])
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';

    @IsOptional()
    @IsString()
    reason?: string;
}