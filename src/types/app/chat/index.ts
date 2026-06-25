export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  sessionId?: string;
  content: string;
}

export interface SendMessageResult {
  session: ChatSession;
  messages: ChatMessage[];
}
