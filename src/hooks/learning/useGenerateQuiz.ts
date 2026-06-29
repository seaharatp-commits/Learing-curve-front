"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateQuizFromArticle } from "@/services/learning.service";
import { QUIZ_LIST_QUERY_KEY } from "./useQuizList";

export const useGenerateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => generateQuizFromArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_LIST_QUERY_KEY });
    },
  });
};
