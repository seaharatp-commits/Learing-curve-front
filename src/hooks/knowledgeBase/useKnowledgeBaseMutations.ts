"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from "@/services/knowledgeBase.service";
import { KNOWLEDGE_BASE_LIST_QUERY_KEY } from "./useKnowledgeBaseList";
import type { KnowledgeBaseFormValues } from "@/types/app/knowledgeBase";

export const useKnowledgeBaseMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: KNOWLEDGE_BASE_LIST_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: KnowledgeBaseFormValues) => createKnowledgeBase(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: KnowledgeBaseFormValues }) =>
      updateKnowledgeBase(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKnowledgeBase(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
};
