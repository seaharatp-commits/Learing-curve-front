import { NextRequest, NextResponse } from "next/server";
import { mockChatSessions, mockMessages, mockKnowledgeBase, nextId } from "@/lib/mock/db";
import type { SendMessagePayload } from "@/types/app/chat";

function generateAiReply(content: string): string {
  const lower = content.toLowerCase();
  const match = mockKnowledgeBase.find(
    (kb) => lower.includes(kb.title.toLowerCase()) || kb.content.toLowerCase().includes(lower)
  );
  if (match) return `จากฐานความรู้ "${match.title}": ${match.content}`;
  return `รับทราบปัญหาของคุณแล้วครับ/ค่ะ: "${content}" — ทีม AI กำลังวิเคราะห์และจะแนะนำวิธีแก้ไขให้เร็วที่สุด`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SendMessagePayload;
  const now = new Date().toISOString();

  let session = mockChatSessions.find((s) => s.id === body.sessionId);
  if (!session) {
    session = {
      id: nextId("session"),
      userId: "current-user",
      title: body.content.slice(0, 40),
      createdAt: now,
      updatedAt: now,
    };
    mockChatSessions.push(session);
  } else {
    session.updatedAt = now;
  }

  const userMessage = {
    id: nextId("msg"),
    sessionId: session.id,
    role: "user" as const,
    content: body.content,
    createdAt: now,
  };
  mockMessages.push(userMessage);

  const aiMessage = {
    id: nextId("msg"),
    sessionId: session.id,
    role: "assistant" as const,
    content: generateAiReply(body.content),
    createdAt: new Date().toISOString(),
  };
  mockMessages.push(aiMessage);

  return NextResponse.json({
    session,
    messages: [userMessage, aiMessage],
  });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const messages = sessionId ? mockMessages.filter((m) => m.sessionId === sessionId) : [];
  return NextResponse.json(messages);
}
