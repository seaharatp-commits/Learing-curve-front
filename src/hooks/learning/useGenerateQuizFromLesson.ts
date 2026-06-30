"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateQuizFromLesson } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import { QUIZ_LIST_QUERY_KEY } from "./useQuizList";
import { lessonQueryKey } from "./useLesson";

export const useGenerateQuizFromLesson = (lessonId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (additionalPrompt: string) => generateQuizFromLesson(lessonId, additionalPrompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKey(lessonId) });
      queryClient.invalidateQueries({ queryKey: QUIZ_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
    },
  });
};
