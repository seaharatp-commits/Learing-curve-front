import { NextRequest, NextResponse } from "next/server";
import { mockIssues, nextId } from "@/lib/mock/db";
import type { IssueFormValues } from "@/types/app/issue";

export async function GET() {
  const sorted = [...mockIssues].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as IssueFormValues;
  const issue = {
    id: nextId("issue"),
    ...body,
    status: "OPEN" as const,
    createdAt: new Date().toISOString(),
  };
  mockIssues.push(issue);
  return NextResponse.json(issue, { status: 201 });
}
