// Dashboard interfaces - TypeScript type definitions for dashboard
export interface IDashboardStats {
    totalUsers: number;
    totalProjects: number;
    totalApplications: number;
    totalRevenue: number;
    recentActivities: any[];
}

export interface IDashboardMetrics {
    userGrowth: number;
    projectCompletion: number;
    averageRating: number;
}