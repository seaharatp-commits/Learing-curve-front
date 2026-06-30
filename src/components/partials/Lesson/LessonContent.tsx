"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Textarea } from "@heroui/react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { useCompleteLesson, useGenerateQuizFromLesson, useLesson } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";

interface LessonContentProps {
  lessonId: string;
}

function extractErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return "สร้างแบบทดสอบไม่สำเร็จ ลองใหม่อีกครั้ง";
}

export default function LessonContent({ lessonId }: LessonContentProps) {
  const router = useRouter();
  const { data: lesson, isLoading } = useLesson(lessonId);
  const completeMutation = useCompleteLesson(lessonId);
  const generateQuizMutation = useGenerateQuizFromLesson(lessonId);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [quizMessage, setQuizMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleGenerateQuiz = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuizMessage(null);
    generateQuizMutation.mutate(additionalPrompt.trim(), {
      onSuccess: (result) => {
        setAdditionalPrompt("");
        router.push(`/quizzes/${result.quizId}`);
      },
      onError: (error) => {
        setQuizMessage({ text: extractErrorMessage(error), isError: true });
      },
    });
  };

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
            บทเรียนนี้ยังไม่มีเนื้อหาเพิ่มเติม คุณสามารถกลับไปเลือกบทเรียนอื่นได้
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
        <form onSubmit={handleGenerateQuiz} className="space-y-3">
          <div>
            <h2 className="font-medium">ถามเพิ่มก่อนสร้างแบบทดสอบ</h2>
            <p className="text-sm text-default-500">
              ใส่คำถามหรือประเด็นล่าสุดที่อยากเน้น ระบบจะใช้รวมกับบทเรียนนี้เพื่อสร้างคำถาม
            </p>
          </div>
          <Textarea
            minRows={3}
            radius="lg"
            variant="bordered"
            value={additionalPrompt}
            onValueChange={setAdditionalPrompt}
            placeholder="เช่น อยากเน้นตัวอย่างใช้งานจริง หรือถามเพิ่มเรื่องข้อควรระวัง"
          />
          <BaseButton
            type="submit"
            startContent={<Sparkles size={16} />}
            isLoading={generateQuizMutation.isPending}
          >
            สร้างแบบทดสอบ
          </BaseButton>
          {quizMessage && (
            <p
              className={`text-xs ${
                quizMessage.isError ? "text-danger-600" : "text-success-600"
              }`}
            >
              {quizMessage.text}
            </p>
          )}
        </form>
      </BaseCard>

      <BaseCard>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList size={20} className="text-default-500" />
          <h2 className="font-medium">แบบทดสอบของบทเรียนนี้</h2>
        </div>
        {lesson.quizzes.length === 0 ? (
          <p className="text-sm text-default-400">
            ยังไม่มีแบบทดสอบสำหรับบทเรียนนี้ สร้างได้จากช่องด้านบนเมื่อพร้อม
          </p>
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
