"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitQuizAttempt } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import { quizAttemptsQueryKey } from "./useQuizAttempts";
import { CAREER_ALIGNMENT_QUERY_KEY, mySkillRadarQueryKey } from "@/hooks/skillRadar";
import type { SubmitAnswer } from "@/types/app/learning";

export const useSubmitQuizAttempt = (quizId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: SubmitAnswer[]) => submitQuizAttempt(quizId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: quizAttemptsQueryKey(quizId) });
      queryClient.invalidateQueries({ queryKey: mySkillRadarQueryKey() });
      queryClient.invalidateQueries({ queryKey: CAREER_ALIGNMENT_QUERY_KEY });
    },
  });
};
