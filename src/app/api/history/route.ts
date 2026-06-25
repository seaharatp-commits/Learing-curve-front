import { NextResponse } from "next/server";
import { mockChatSessions, mockMessages } from "@/lib/mock/db";
import type { HistoryItem } from "@/types/app/history";

export async function GET() {
  const items: HistoryItem[] = mockChatSessions
    .map((session) => {
      const sessionMessages = mockMessages.filter((m) => m.sessionId === session.id);
      const last = sessionMessages[sessionMessages.length - 1];
      return {
        ...session,
        lastMessage: last?.content ?? "",
        messageCount: sessionMessages.length,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json(items);
}
