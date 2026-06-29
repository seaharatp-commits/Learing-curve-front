"use client";

import { useMemo, useState } from "react";
import { useDashboardStats } from "@/hooks/dashboard";
import { useIssueList, useLearnFromIssue } from "@/hooks/issue";
import { BaseCard } from "@/components/ui/Card";
import { BaseButton } from "@/components/ui/Button";
import {
  MessageSquare,
  FileWarning,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "เปิดอยู่",
  IN_PROGRESS: "กำลังดำเนินการ",
  RESOLVED: "แก้ไขแล้ว",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "ต่ำ",
  MEDIUM: "กลาง",
  HIGH: "สูง",
};

export default function DashboardContent() {
  const { data, isLoading } = useDashboardStats();
  const { data: issues, isLoading: isIssuesLoading } = useIssueList();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [resultMessages, setResultMessages] = useState<Record<string, string>>({});
  const learnFromIssue = useLearnFromIssue();

  const handleLearn = (issueId: string) => {
    learnFromIssue.mutate(issueId, {
      onSuccess: (result) => {
        setResultMessages((prev) => ({
          ...prev,
          [issueId]:
            result.action === "created"
              ? `สร้างความรู้ใหม่ "${result.article.title}" และปิดปัญหานี้แล้ว`
              : `ปรับปรุงความรู้ "${result.article.title}" และปิดปัญหานี้แล้ว`,
        }));
      },
      onError: () => {
        setResultMessages((prev) => ({ ...prev, [issueId]: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" }));
      },
    });
  };

  const issuesByCategory = useMemo(() => {
    const map = new Map<string, typeof issues>();
    issues.forEach((issue) => {
      const list = map.get(issue.category) ?? [];
      list.push(issue);
      map.set(issue.category, list);
    });
    return map;
  }, [issues]);

  const cards = [
    { label: "บทสนทนาทั้งหมด", value: data?.totalChats ?? 0, icon: MessageSquare },
    // { label: "ปัญหาที่แจ้งทั้งหมด", value: data?.totalIssues ?? 0, icon: FileWarning },
    // { label: "ปัญหาที่แก้ไขแล้ว", value: data?.resolvedIssues ?? 0, icon: CheckCircle2 },
    { label: "บทความในฐานความรู้", value: data?.knowledgeBaseCount ?? 0, icon: BookOpen },
    { label: "แบบทดสอบ", value: data?.quizCount ?? 0, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <BaseCard key={card.label}>
              <div className="flex items-center gap-3">
                <Icon size={24} className="text-primary" />
                <div>
                  <p className="text-2xl font-semibold">{card.value}</p>
                  <p className="text-sm text-default-500">{card.label}</p>
                </div>
              </div>
            </BaseCard>
          );
        })}
      </div>

      {/* <BaseCard>
        <h2 className="mb-3 font-medium">ปัญหาตามหมวดหมู่</h2>
        {(data?.issuesByCategory.length ?? 0) === 0 ? (
          <p className="text-sm text-default-400">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="space-y-1">
            {data?.issuesByCategory.map((row) => {
              const isExpanded = expandedCategory === row.category;
              const categoryIssues = issuesByCategory.get(row.category) ?? [];
              return (
                <div key={row.category} className="rounded-lg">
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(isExpanded ? null : row.category)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-default-100"
                  >
                    <span className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {row.category}
                    </span>
                    <span className="font-medium">{row.count}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mb-2 space-y-2 border-l border-default-200 pl-4">
                      {isIssuesLoading && <p className="text-xs text-default-400">กำลังโหลด...</p>}
                      {!isIssuesLoading && categoryIssues.length === 0 && (
                        <p className="text-xs text-default-400">ไม่มีปัญหาในหมวดหมู่นี้</p>
                      )}
                      {categoryIssues.map((issue) => {
                        const isLearningThis =
                          learnFromIssue.isPending && learnFromIssue.variables === issue.id;
                        const resultMessage = resultMessages[issue.id];
                        return (
                          <div key={issue.id} className="rounded-lg bg-default-50 p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{issue.title}</span>
                              <span className="text-default-400">
                                {dayjs(issue.createdAt).format("DD MMM YYYY HH:mm")}
                              </span>
                            </div>
                            <p className="mt-1 text-default-500">{issue.description}</p>
                            <div className="mt-1 flex items-center gap-3 text-default-400">
                              <span>สถานะ: {STATUS_LABEL[issue.status] ?? issue.status}</span>
                              <span>ความสำคัญ: {PRIORITY_LABEL[issue.priority] ?? issue.priority}</span>
                              <span>ผู้แจ้ง: {issue.reporterName}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              {issue.status !== "RESOLVED" && (
                                <BaseButton
                                  size="sm"
                                  variant="flat"
                                  startContent={<Sparkles size={12} />}
                                  isLoading={isLearningThis}
                                  onPress={() => handleLearn(issue.id)}
                                >
                                  ให้ AI แก้ปัญหานี้ลงฐานความรู้
                                </BaseButton>
                              )}
                              {resultMessage && (
                                <span className="text-success-600">{resultMessage}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </BaseCard> */}
    </div>
  );
}
