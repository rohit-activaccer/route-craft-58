import { useQuery } from '@tanstack/react-query';
import { apiService, DashboardOverview, RecentActivity, PerformanceMetrics, CarrierPerformance, FinancialSummary, SystemHealth } from '@/lib/api';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => apiService.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => apiService.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const usePerformanceMetrics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['dashboard', 'performance-metrics', period],
    queryFn: () => apiService.getPerformanceMetrics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useCarrierPerformance = () => {
  return useQuery({
    queryKey: ['dashboard', 'carrier-performance'],
    queryFn: () => apiService.getCarrierPerformance(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

export const useFinancialSummary = (period: string = '30d') => {
  return useQuery({
    queryKey: ['dashboard', 'financial-summary', period],
    queryFn: () => apiService.getFinancialSummary(period),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['dashboard', 'system-health'],
    queryFn: () => apiService.getSystemHealth(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
  });
}; 