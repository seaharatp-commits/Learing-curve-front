"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GenerateLessonFromTopicPayload } from "@/types/app/learning";
import { generateLessonFromTopic } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import { QUIZ_LIST_QUERY_KEY } from "./useQuizList";

export const useGenerateLessonFromTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateLessonFromTopicPayload) => generateLessonFromTopic(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
    },
  });
};
