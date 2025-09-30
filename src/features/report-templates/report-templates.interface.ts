export interface IReportTemplate {
    id?: number;
    report_module: string;
    title?: string;
    filters?: object;
    metrics?: object;
    group_by?: string;
    visual_type?: string;
    created_by: number;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
  }
  