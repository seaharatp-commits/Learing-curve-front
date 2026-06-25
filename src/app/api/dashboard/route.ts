import { NextResponse } from "next/server";
import { mockChatSessions, mockIssues, mockKnowledgeBase } from "@/lib/mock/db";
import type { DashboardStats } from "@/types/app/dashboard";

export async function GET() {
  const categoryMap = new Map<string, number>();
  mockIssues.forEach((issue) => {
    categoryMap.set(issue.category, (categoryMap.get(issue.category) ?? 0) + 1);
  });

  const stats: DashboardStats = {
    totalChats: mockChatSessions.length,
    totalIssues: mockIssues.length,
    openIssues: mockIssues.filter((i) => i.status === "OPEN").length,
    resolvedIssues: mockIssues.filter((i) => i.status === "RESOLVED").length,
    knowledgeBaseCount: mockKnowledgeBase.length,
    issuesByCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    })),
  };

  return NextResponse.json(stats);
}
