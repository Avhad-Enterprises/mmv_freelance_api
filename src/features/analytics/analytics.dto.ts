import { IsString } from 'class-validator';

export class AnalyticsDto {
    @IsString()
    tracking_id!: string;
}
