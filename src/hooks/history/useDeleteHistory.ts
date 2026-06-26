"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHistory } from "@/services/history.service";
import { HISTORY_LIST_QUERY_KEY } from "./useHistoryList";

export const useDeleteHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteHistory(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_LIST_QUERY_KEY });
    },
  });
};
