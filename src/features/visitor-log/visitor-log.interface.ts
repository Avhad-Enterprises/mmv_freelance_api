// Visitor log interfaces - TypeScript type definitions for visitor tracking
export interface IVisitorLog {
    visitor_log_id?: number;
    ip_address: string;
    user_agent?: string;
    page_url: string;
    referrer?: string;
    session_id?: string;
    user_id?: number;
    visit_duration?: number;
    created_at?: Date;
}

export interface IVisitorAnalytics {
    totalVisits: number;
    uniqueVisitors: number;
    topPages: any[];
    topReferrers: any[];
}