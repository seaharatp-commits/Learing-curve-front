"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendChatMessage } from "@/services/chat.service";
import type { SendMessagePayload } from "@/types/app/chat";
import { HISTORY_LIST_QUERY_KEY } from "@/hooks/history/useHistoryList";
import { CAREER_ALIGNMENT_QUERY_KEY, mySkillRadarQueryKey } from "@/hooks/skillRadar";

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => sendChatMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: mySkillRadarQueryKey() });
      queryClient.invalidateQueries({ queryKey: CAREER_ALIGNMENT_QUERY_KEY });
    },
  });
  return mutation;
};
