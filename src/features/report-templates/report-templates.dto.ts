import { IsString, IsOptional, IsArray, IsJSON, IsObject, IsNumber } from 'class-validator';

export class ReportTemplateDTO {
  @IsOptional()
  @IsNumber()
  id: number;
  
  @IsOptional()
  @IsString()
  report_module: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  filters?: object;

  @IsOptional()
  @IsObject()
  metrics?: object[];

  @IsOptional()
  @IsString()
  group_by?: string;

  @IsOptional()
  @IsString()
  visual_type?: string;

  @IsOptional()
  @IsNumber()
  deleted_by: number;

}

