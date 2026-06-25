"use client";

import { useDashboardStats } from "@/hooks/dashboard";
import { BaseCard } from "@/components/ui/Card";
import { MessageSquare, FileWarning, CheckCircle2, BookOpen } from "lucide-react";

export default function DashboardContent() {
  const { data, isLoading } = useDashboardStats();

  const cards = [
    { label: "บทสนทนาทั้งหมด", value: data?.totalChats ?? 0, icon: MessageSquare },
    { label: "ปัญหาที่แจ้งทั้งหมด", value: data?.totalIssues ?? 0, icon: FileWarning },
    { label: "ปัญหาที่แก้ไขแล้ว", value: data?.resolvedIssues ?? 0, icon: CheckCircle2 },
    { label: "บทความในฐานความรู้", value: data?.knowledgeBaseCount ?? 0, icon: BookOpen },
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

      <BaseCard>
        <h2 className="mb-3 font-medium">ปัญหาตามหมวดหมู่</h2>
        {(data?.issuesByCategory.length ?? 0) === 0 ? (
          <p className="text-sm text-default-400">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="space-y-2">
            {data?.issuesByCategory.map((row) => (
              <div key={row.category} className="flex items-center justify-between text-sm">
                <span>{row.category}</span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
          </div>
        )}
      </BaseCard>
    </div>
  );
}
