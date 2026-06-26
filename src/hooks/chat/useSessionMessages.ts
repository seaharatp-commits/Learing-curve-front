"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessionMessages } from "@/services/chat.service";

export const useSessionMessages = (sessionId?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["sessionMessages", sessionId],
    queryFn: () => getSessionMessages(sessionId as string),
    enabled: Boolean(sessionId),
  });
  return { data: data ?? [], isLoading };
};
