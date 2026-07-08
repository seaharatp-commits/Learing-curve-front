import type { ChatMessage, SendMessagePayload, SendMessageResult, SuggestedQuestionsResult } from "@/types/app/chat";
import { sendChatMessageApi, getSessionMessagesApi, getSuggestedQuestionsApi } from "@/lib/api/api-main";

const normalizeMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  role: (message.role as unknown as string).toLowerCase() as ChatMessage["role"],
});

export const sendChatMessage = async (payload: SendMessagePayload): Promise<SendMessageResult> => {
  const res = await sendChatMessageApi(payload);
  return {
    session: res.data.session,
    messages: res.data.messages.map(normalizeMessage),
    recommendedKnowledgeBases: res.data.recommendedKnowledgeBases,
  };
};

export const getSessionMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const res = await getSessionMessagesApi(sessionId);
  return res.data.map(normalizeMessage);
};

export const getSuggestedQuestions = async (): Promise<SuggestedQuestionsResult> => {
  const res = await getSuggestedQuestionsApi();
  return res.data;
};
