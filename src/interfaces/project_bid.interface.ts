export interface IProjectBid {
    bid_id?: number;
    project_id: number;
    freelancer_id: number;
    application_id: number;
    bid_amount: number;
    delivery_time_days: number;
    proposal: string;
    milestones?: any[];
    status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    is_featured?: boolean;
    featured_until?: Date;
    additional_services?: any;
    is_active?: boolean;
    is_deleted?: boolean;
    created_by?: number;
    created_at?: Date;
    updated_by?: number;
    updated_at?: Date;
    deleted_by?: number;
    deleted_at?: Date;
}