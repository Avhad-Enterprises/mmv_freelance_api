import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Max,
  Min,
} from 'class-validator';

export class ReviewDto {
  @IsInt({ groups: ['update'] })
  id: number;

  @IsInt({ groups: ['create', 'update'] })
  project_id: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  client_id?: number;

  @IsInt({ groups: ['create', 'update'] })
  user_id: number;

  @IsInt({ groups: ['create', 'update'] })
  @Min(1, { groups: ['create', 'update'] })
  @Max(5, { groups: ['create', 'update'] })
  rating: number;

  @IsString({ groups: ['create', 'update'] })
  review: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsBoolean({ groups: ['create', 'update'] })
  is_deleted?: boolean;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @IsOptional()
  @IsDateString()
  deleted_at?: string;
}
