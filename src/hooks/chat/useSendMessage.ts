"use client";

import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "@/services/chat.service";
import type { SendMessagePayload } from "@/types/app/chat";

export const useSendMessage = () => {
  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => sendChatMessage(payload),
  });
  return mutation;
};
