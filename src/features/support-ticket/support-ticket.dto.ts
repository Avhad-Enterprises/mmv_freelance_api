import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsObject,
  IsDefined,
  IsDate,
} from 'class-validator';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class SupportTicketDto {
  @IsOptional({ groups: ['update'] })
  @IsInt({ groups: ['update'] })
  id?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  user_id?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  client_id?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  project_id?: number;

  @IsString({ groups: ['create', 'update'] })
  ticket_category: string;

  @IsString({ groups: ['create', 'update'] })
  title: string;

  @IsString({ groups: ['create', 'update'] })
  subject: string;

  @IsString({ groups: ['create', 'update'] })
  description: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsEnum(TicketPriority, { groups: ['create', 'update'] })
  priority?: TicketPriority;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  assigned_agent_id?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsDate({ groups: ['create', 'update'] })
  project_asign_date?: Date;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  response_time?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsDate({ groups: ['create', 'update'] })
  resolution_date?: Date;

  @IsOptional({ groups: ['create', 'update'] })
  @IsObject({ groups: ['create', 'update'] })
  communication_logs?: Record<string, any>;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  resolution_notes?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  satisfaction_rating?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  feedback_comment?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  payment_type?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  platform_used?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  support_language?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsEmail({}, { groups: ['create', 'update'] })
  email?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  location?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  ip_address?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  os_info?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] })
  browser_info?: string;

  @IsOptional({ groups: ['create', 'update'] })
  @IsEnum(TicketStatus, { groups: ['create', 'update'] })
  status?: TicketStatus;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  created_by?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  updated_by?: number;

  @IsOptional({ groups: ['create', 'update'] })
  @IsBoolean({ groups: ['create', 'update'] })
  is_deleted?: boolean;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  deleted_by?: number;
}
