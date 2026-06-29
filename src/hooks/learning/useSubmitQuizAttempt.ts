"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitQuizAttempt } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import type { SubmitAnswer } from "@/types/app/learning";

export const useSubmitQuizAttempt = (quizId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: SubmitAnswer[]) => submitQuizAttempt(quizId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
    },
  });
};
