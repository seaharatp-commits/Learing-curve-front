export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  sourceType?: "KNOWLEDGE_BASE" | "GENERAL_AI" | null;
  sourceArticleId?: string | null;
  sourceArticleTitle?: string | null;
  sourceConfidenceScore?: number | null;
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
  knowledgeBaseArticleId?: string;
  knowledgeBaseConfidenceScore?: number;
  content: string;
}

export interface SendMessageResult {
  session: ChatSession;
  messages: ChatMessage[];
}
