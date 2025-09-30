// Report interfaces - TypeScript type definitions for report system
export interface IReport {
    report_id?: number;
    reporter_id: number;
    reported_user_id: number;
    project_id?: number;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at?: Date;
    updated_at?: Date;
}

export interface IReportAnalytics {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    reportsByCategory: any[];
}