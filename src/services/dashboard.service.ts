import type { DashboardStats } from "@/types/app/dashboard";
import { getDashboardStatsApi } from "@/lib/api/api-main";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await getDashboardStatsApi();
  return res.data;
};
