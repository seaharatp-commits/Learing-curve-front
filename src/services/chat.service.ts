import type { ChatMessage, SendMessagePayload, SendMessageResult } from "@/types/app/chat";
import { sendChatMessageApi } from "@/lib/api/api-main";
import { mainClient } from "@/lib/api/client";

export const sendChatMessage = async (payload: SendMessagePayload): Promise<SendMessageResult> => {
  const res = await sendChatMessageApi(payload);
  return res.data;
};

export const getSessionMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const res = await mainClient.get<ChatMessage[]>("/api/chat", { params: { sessionId } });
  return res.data;
};
