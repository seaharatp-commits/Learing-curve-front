import { NextRequest, NextResponse } from "next/server";
import { mockKnowledgeBase, nextId } from "@/lib/mock/db";
import type { KnowledgeBaseFormValues } from "@/types/app/knowledgeBase";

export async function GET() {
  const sorted = [...mockKnowledgeBase].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as KnowledgeBaseFormValues;
  const now = new Date().toISOString();
  const item = { id: nextId("kb"), ...body, createdAt: now, updatedAt: now };
  mockKnowledgeBase.push(item);
  return NextResponse.json(item, { status: 201 });
}
