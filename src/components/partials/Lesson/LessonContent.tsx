"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList, ArrowRight } from "lucide-react";
import { useCompleteLesson, useLesson } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";

interface LessonContentProps {
  lessonId: string;
}

export default function LessonContent({ lessonId }: LessonContentProps) {
  const router = useRouter();
  const { data: lesson, isLoading } = useLesson(lessonId);
  const completeMutation = useCompleteLesson(lessonId);

  if (isLoading || !lesson) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-default-400">กำลังโหลดบทเรียน...</p>
      </div>
    );
  }

  const paragraphs = lesson.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isCompleted = lesson.completed || completeMutation.isSuccess;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1 text-sm text-default-500 hover:text-default-700"
      >
        <ArrowLeft size={16} />
        กลับแดชบอร์ด
      </button>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-default-500">บทเรียน</p>
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        </div>
        <BaseButton
          color={isCompleted ? "success" : "primary"}
          variant={isCompleted ? "flat" : "solid"}
          startContent={<CheckCircle2 size={16} />}
          isDisabled={isCompleted}
          isLoading={completeMutation.isPending}
          onPress={() => completeMutation.mutate()}
        >
          {isCompleted ? "เรียนจบแล้ว" : "เรียนจบบทนี้"}
        </BaseButton>
      </div>

      <BaseCard>
        {paragraphs.length === 0 ? (
          <p className="text-sm text-default-500">
            บทเรียนนี้ยังไม่มีเนื้อหาเพิ่มเติม คุณสามารถทำแบบทดสอบที่เกี่ยวข้องหรือกลับไปเลือกบทเรียนอื่นได้
          </p>
        ) : (
          <div className="space-y-4 text-sm leading-7 text-default-700 dark:text-default-300">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </BaseCard>

      <BaseCard>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList size={20} className="text-default-500" />
          <h2 className="font-medium">แบบทดสอบของบทเรียนนี้</h2>
        </div>
        {lesson.quizzes.length === 0 ? (
          <p className="text-sm text-default-400">ยังไม่มีแบบทดสอบสำหรับบทเรียนนี้</p>
        ) : (
          <div className="space-y-2">
            {lesson.quizzes.map((quiz) =>
              quiz.questionCount > 0 ? (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.id}`}
                  className="flex items-center justify-between rounded-lg bg-default-50 px-3 py-2 transition-colors hover:bg-default-100 dark:bg-default-100/10 dark:hover:bg-default-100/20"
                >
                  <div>
                    <p className="text-sm font-medium">{quiz.title}</p>
                    <p className="text-xs text-default-500">{quiz.questionCount} คำถาม</p>
                  </div>
                  <ArrowRight size={16} className="text-default-400" />
                </Link>
              ) : (
                <div
                  key={quiz.id}
                  className="rounded-lg bg-default-50 px-3 py-2 text-sm text-default-400 dark:bg-default-100/10"
                >
                  {quiz.title} ยังไม่มีคำถาม
                </div>
              ),
            )}
          </div>
        )}
      </BaseCard>
    </div>
  );
}
