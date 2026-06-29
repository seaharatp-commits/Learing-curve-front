"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markLessonCompleted } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import { lessonQueryKey } from "./useLesson";

export const useCompleteLesson = (lessonId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markLessonCompleted(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKey(lessonId) });
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
    },
  });
};
