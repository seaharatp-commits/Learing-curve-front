"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuggestedQuestions } from "@/services/chat.service";

export const useSuggestedQuestions = (enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["suggestedQuestions"],
    queryFn: getSuggestedQuestions,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { questions: data?.questions ?? [], isLoading, isError };
};
