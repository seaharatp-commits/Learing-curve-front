"use client";

import { useQuery } from "@tanstack/react-query";
import { getCareerReadinessBenchmark } from "@/services/skill-radar.service";

export const CAREER_READINESS_BENCHMARK_QUERY_KEY = ["careerReadinessBenchmark"] as const;

export const useCareerReadinessBenchmark = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: CAREER_READINESS_BENCHMARK_QUERY_KEY,
    queryFn: getCareerReadinessBenchmark,
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, isError, error };
};
