"use client";

import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import { useQuizList } from "@/hooks/learning";
import { BaseCard } from "@/components/ui/Card";

export default function QuizListContent() {
  const { data, isLoading } = useQuizList();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">แบบทดสอบ</h1>
        <p className="text-sm text-default-500">
          แบบทดสอบปรนัยที่สร้างจากบทความในฐานความรู้ ลองทำเพื่อทดสอบความเข้าใจของคุณ
        </p>
      </div>

      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}

      {!isLoading && data.length === 0 && (
        <BaseCard>
          <p className="text-sm text-default-400">ยังไม่มีแบบทดสอบในระบบ</p>
        </BaseCard>
      )}

      <div className="space-y-3">
        {data.map((quiz) => (
          <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
            <BaseCard className="transition-colors hover:bg-default-50 dark:hover:bg-default-100/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/15 p-2 text-primary">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">{quiz.title}</h3>
                    <p className="text-xs text-default-500">
                      {quiz.questionCount} คำถาม
                      {quiz.sourceArticleTitle ? ` · จากบทความ "${quiz.sourceArticleTitle}"` : ""}
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-default-400" />
              </div>
            </BaseCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
