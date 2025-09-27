import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class TicketReplyDto {
  @IsInt()
  ticket_id: number;

  @IsInt()
  sender_id: number;

  @IsString()
  @IsIn(['client', 'freelancer', 'admin'])
  sender_role: 'client' | 'freelancer' | 'admin';

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;
}
