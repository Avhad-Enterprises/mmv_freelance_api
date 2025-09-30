import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class TicketNoteDto {
  @IsInt()
  ticket_id: number;

  @IsInt()
  admin_id: number;

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;
}
