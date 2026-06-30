"use client";

import { useDashboardStats } from "@/hooks/dashboard";
import { BaseCard } from "@/components/ui/Card";
import { MessageSquare, BookOpen, ClipboardList } from "lucide-react";

export default function DashboardContent() {
  const { data, isLoading } = useDashboardStats();

  const cards = [
    { label: "บทสนทนาทั้งหมด", value: data?.totalChats ?? 0, icon: MessageSquare },
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
    </div>
  );
}
