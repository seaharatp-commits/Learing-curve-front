"use client";

import { useQuery } from "@tanstack/react-query";
import { getLearningDashboard } from "@/services/learning.service";

export const LEARNING_DASHBOARD_QUERY_KEY = ["learningDashboard"] as const;

export const useLearningDashboard = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: LEARNING_DASHBOARD_QUERY_KEY,
    queryFn: getLearningDashboard,
  });
  return { data, isLoading, isError, error };
};
