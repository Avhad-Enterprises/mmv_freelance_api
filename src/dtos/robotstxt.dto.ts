import {
    IsString, IsOptional, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RobotsDto {

 @IsString()
content: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;

}


