"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmKnowledge } from "@/services/knowledgeBase.service";
import { KNOWLEDGE_BASE_LIST_QUERY_KEY } from "./useKnowledgeBaseList";

export const useConfirmKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_BASE_LIST_QUERY_KEY });
    },
  });
};
