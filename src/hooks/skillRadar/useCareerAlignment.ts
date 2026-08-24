"use client";

import { useQuery } from "@tanstack/react-query";
import { getCareerAlignment } from "@/services/skill-radar.service";

export const CAREER_ALIGNMENT_QUERY_KEY = ["careerAlignment"] as const;

export const useCareerAlignment = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: CAREER_ALIGNMENT_QUERY_KEY,
    queryFn: getCareerAlignment,
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, isFetching, isError, error, refetch };
};
