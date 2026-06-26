import type { LearningDashboard } from "@/types/app/learning";
import { getLearningDashboardApi } from "@/lib/api/api-main";

export const getLearningDashboard = async (): Promise<LearningDashboard> => {
  const res = await getLearningDashboardApi();
  return res.data;
};
