import { NextRequest, NextResponse } from "next/server";
import { mockKnowledgeBase } from "@/lib/mock/db";
import type { KnowledgeBaseFormValues } from "@/types/app/knowledgeBase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as KnowledgeBaseFormValues;
  const item = mockKnowledgeBase.find((kb) => kb.id === id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  Object.assign(item, body, { updatedAt: new Date().toISOString() });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = mockKnowledgeBase.findIndex((kb) => kb.id === id);
  if (index === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });

  mockKnowledgeBase.splice(index, 1);
  return NextResponse.json({ success: true });
}
