"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizAttempts } from "@/services/learning.service";

export const quizAttemptsQueryKey = (quizId: string) => ["quiz-attempts", quizId] as const;

export const useQuizAttempts = (quizId: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: quizAttemptsQueryKey(quizId),
    queryFn: () => getQuizAttempts(quizId),
    enabled: !!quizId,
  });

  return { data, isLoading, isError, error };
};
