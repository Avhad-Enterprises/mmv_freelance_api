// Dashboard DTOs - placeholder file for dashboard data transfer objects
export interface DashboardStatsDto {
    totalUsers?: number;
    totalProjects?: number;
    totalApplications?: number;
    totalRevenue?: number;
}

export interface DashboardFiltersDto {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
}