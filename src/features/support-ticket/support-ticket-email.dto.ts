import {
  IsInt,
  IsEmail,
  IsString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class EmailLogDto {
  @IsInt()
  ticket_id: number;

  @IsEmail()
  to_email: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsIn(['sent', 'failed'])
  status: 'sent' | 'failed';

  @IsOptional()
  @IsDateString()
  sent_at?: string;
}
