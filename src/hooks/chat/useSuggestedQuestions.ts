"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuggestedQuestions } from "@/services/chat.service";

export const SUGGESTED_QUESTIONS_QUERY_ROOT = ["suggestedQuestions"] as const;

export const suggestedQuestionsQueryKey = (positionId?: string) =>
  [...SUGGESTED_QUESTIONS_QUERY_ROOT, positionId ?? "default"] as const;

export const useSuggestedQuestions = (enabled = true, positionId?: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: suggestedQuestionsQueryKey(positionId),
    queryFn: getSuggestedQuestions,
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return { questions: data?.questions ?? [], isLoading, isError, refetch };
};
