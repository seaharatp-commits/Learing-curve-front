"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizForAttempt } from "@/services/learning.service";

export const useQuiz = (quizId: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizForAttempt(quizId),
    enabled: !!quizId,
  });
  return { data, isLoading, isError, error };
};
