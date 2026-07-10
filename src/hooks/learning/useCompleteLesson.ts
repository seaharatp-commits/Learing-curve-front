"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markLessonCompleted } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import { lessonQueryKey } from "./useLesson";
import { CAREER_ALIGNMENT_QUERY_KEY, mySkillRadarQueryKey } from "@/hooks/skillRadar";

export const useCompleteLesson = (lessonId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markLessonCompleted(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKey(lessonId) });
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: mySkillRadarQueryKey() });
      queryClient.invalidateQueries({ queryKey: CAREER_ALIGNMENT_QUERY_KEY });
    },
  });
};
