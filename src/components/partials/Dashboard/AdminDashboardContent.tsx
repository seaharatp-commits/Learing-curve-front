"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/dashboard";
import { useKnowledgeBaseList } from "@/hooks/knowledgeBase";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function AdminDashboardContent() {
  const { data, isLoading: isStatsLoading } = useDashboardStats();
  const { data: knowledgeBaseItems, isLoading: isKnowledgeLoading } = useKnowledgeBaseList();
  const recentKnowledge = knowledgeBaseItems.slice(0, 3);

  const statCards = [
    { label: "ผู้ใช้ทั้งหมด", value: data?.userCount ?? 0, icon: Users },
    { label: "บทสนทนาทั้งหมด", value: data?.totalChats ?? 0, icon: MessageSquare },
    { label: "บทความในฐานความรู้", value: data?.knowledgeBaseCount ?? 0, icon: BookOpen },
    { label: "แบบทดสอบ", value: data?.quizCount ?? 0, icon: ClipboardList },
    { label: "การทำแบบทดสอบ", value: data?.quizAttemptCount ?? 0, icon: Trophy },
    { label: "บทเรียนที่เรียนจบ", value: data?.completedLessonCount ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Learning Curve · Admin</h1>
        <p className="text-sm text-default-500">ภาพรวมระบบและทางลัดสำหรับจัดการฐานความรู้</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-default-600">สถิติระบบ</h2>
        {isStatsLoading ? (
          <BaseCard>
            <p className="text-sm text-default-400">กำลังโหลดสถิติระบบ...</p>
          </BaseCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {statCards.map((card) => {
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
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-default-600">Knowledge Base ล่าสุด</h2>
          <Link href="/admin/knowledge-base">
            <BaseButton size="sm" variant="flat" endContent={<ArrowRight size={14} />}>
              จัดการทั้งหมด
            </BaseButton>
          </Link>
        </div>

        {isKnowledgeLoading ? (
          <BaseCard>
            <p className="text-sm text-default-400">กำลังโหลดข้อมูลฐานความรู้...</p>
          </BaseCard>
        ) : recentKnowledge.length === 0 ? (
          <BaseCard>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BookOpen size={26} className="text-primary" />
              <h3 className="font-semibold">ยังไม่มีข้อมูลในฐานความรู้</h3>
              <p className="max-w-md text-sm text-default-500">
                เพิ่มข้อมูลแรกเพื่อให้ AI Chat สามารถนำไปใช้ตอบคำถามได้
              </p>
              <Link href="/admin/knowledge-base">
                <BaseButton className="mt-2" startContent={<Plus size={16} />}>
                  เพิ่ม Knowledge Base
                </BaseButton>
              </Link>
            </div>
          </BaseCard>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {recentKnowledge.map((item) => (
              <BaseCard key={item.id}>
                <span className="inline-flex w-fit rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                  {item.category}
                </span>
                <h3 className="mt-2 line-clamp-1 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-default-500">
                  {item.summary || item.content}
                </p>
                <p className="mt-3 text-[11px] text-default-400">อัปเดต {formatDate(item.updatedAt)}</p>
              </BaseCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
