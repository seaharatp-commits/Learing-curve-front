"use client";

import { useDashboardStats } from "@/hooks/dashboard";
import { BaseCard } from "@/components/ui/Card";
import { MessageSquare, BookOpen, ClipboardList, Users, CheckCircle2, Trophy } from "lucide-react";
import { extractErrorMessage } from "@/utils/extractErrorMessage";

export default function DashboardContent() {
  const { data, isLoading, isError, error } = useDashboardStats();

  const cards = [
    { label: "ผู้ใช้ทั้งหมด", value: data?.userCount ?? 0, icon: Users },
    { label: "บทสนทนาทั้งหมด", value: data?.totalChats ?? 0, icon: MessageSquare },
    { label: "บทความในฐานความรู้", value: data?.knowledgeBaseCount ?? 0, icon: BookOpen },
    { label: "แบบทดสอบ", value: data?.quizCount ?? 0, icon: ClipboardList },
    { label: "การทำแบบทดสอบ", value: data?.quizAttemptCount ?? 0, icon: Trophy },
    { label: "บทเรียนที่เรียนจบ", value: data?.completedLessonCount ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}
      {isError && (
        <BaseCard>
          <p className="text-sm text-danger-600">
            {extractErrorMessage(error, "โหลดข้อมูล Dashboard ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
          </p>
        </BaseCard>
      )}
      {!isError && (
      <div className="grid gap-4 md:grid-cols-3">
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
      )}
    </div>
  );
}
