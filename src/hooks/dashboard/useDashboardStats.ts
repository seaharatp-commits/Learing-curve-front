"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboard.service";

export const DASHBOARD_STATS_QUERY_KEY = ["dashboardStats"] as const;

export const useDashboardStats = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: getDashboardStats,
  });
  return { data, isLoading, isError, error, refetch };
};
