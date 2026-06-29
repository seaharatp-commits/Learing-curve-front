"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateQuizFromTopic } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";
import { QUIZ_LIST_QUERY_KEY } from "./useQuizList";

export const useGenerateQuizFromTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topic: string) => generateQuizFromTopic(topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
    },
  });
};
