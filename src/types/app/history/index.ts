import type { ChatSession } from "@/types/app/chat";

export interface HistoryItem extends ChatSession {
  lastMessage: string;
  messageCount: number;
}
