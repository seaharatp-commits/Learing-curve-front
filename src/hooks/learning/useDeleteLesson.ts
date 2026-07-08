"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLesson } from "@/services/learning.service";
import { LEARNING_DASHBOARD_QUERY_KEY } from "./useLearningDashboard";

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_DASHBOARD_QUERY_KEY });
    },
  });
};
