"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { askLessonQuestion } from "@/services/learning.service";
import { CAREER_ALIGNMENT_QUERY_KEY, mySkillRadarQueryKey } from "@/hooks/skillRadar";

export const useAskLessonQuestion = (lessonId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, chatHistory }: { message: string; chatHistory: string }) =>
      askLessonQuestion(lessonId, message, chatHistory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mySkillRadarQueryKey() });
      queryClient.invalidateQueries({ queryKey: CAREER_ALIGNMENT_QUERY_KEY });
    },
  });
};
