"use client";

import { useState, type FormEvent } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Progress } from "@heroui/react";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { useGenerateLessonFromTopic, useLearningDashboard } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-success-600";
  if (score >= 60) return "text-warning-600";
  return "text-danger-600";
};

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
  return "สร้างบทเรียนไม่สำเร็จ ลองใหม่อีกครั้ง";
}

export default function LearningDashboardContent() {
  const router = useRouter();
  const { data, isLoading } = useLearningDashboard();
  const generateLessonMutation = useGenerateLessonFromTopic();
  const [topic, setTopic] = useState("");
  const [topicMessage, setTopicMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );

  const handleGenerateLesson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTopic = topic.trim();
    if (cleanTopic.length < 2) {
      setTopicMessage({ text: "กรุณาพิมพ์หัวข้ออย่างน้อย 2 ตัวอักษร", isError: true });
      return;
    }

    setTopicMessage(null);
    generateLessonMutation.mutate(cleanTopic, {
      onSuccess: (result) => {
        setTopic("");
        router.push(`/lessons/${result.lessonId}`);
      },
      onError: (error) => {
        setTopicMessage({ text: extractErrorMessage(error), isError: true });
      },
    });
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-default-400">กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  const { learningProgress, quizPerformance, recentQuizzes, continueLearning } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ดการเรียนรู้</h1>
        <p className="text-sm text-default-500">
          ภาพรวมความก้าวหน้าและผลคะแนนแบบทดสอบของคุณ
        </p>
      </div>

      <BaseCard className="bg-primary-50/60 dark:bg-primary-500/10">
        <form onSubmit={handleGenerateLesson} className="flex flex-col gap-3 sm:flex-row">
          <BaseInput
            label="อยากเรียนเรื่องอะไร?"
            placeholder="เช่น การเขียน prompt ให้ชัดเจน"
            value={topic}
            onValueChange={setTopic}
            className="flex-1"
          />
          <BaseButton
            type="submit"
            startContent={<Sparkles size={16} />}
            isLoading={generateLessonMutation.isPending}
            className="sm:self-end"
          >
            สร้างบทเรียน
          </BaseButton>
        </form>
        {topicMessage && (
          <p
            className={`mt-2 text-xs ${
              topicMessage.isError ? "text-danger-600" : "text-success-600"
            }`}
          >
            {topicMessage.text}
          </p>
        )}
      </BaseCard>

      <div className="grid gap-4 md:grid-cols-2">
        <BaseCard className="bg-primary-50/60 dark:bg-primary-500/10">
          <div className="flex items-center gap-2 text-primary-600">
            <GraduationCap size={20} />
            <h2 className="font-medium">ความก้าวหน้าในการเรียน</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold">{learningProgress.percentage}%</p>
          <p className="mb-2 text-sm text-default-500">
            เรียนจบแล้ว {learningProgress.completedLessons} จาก{" "}
            {learningProgress.totalLessons} บทเรียน
          </p>
          <Progress
            aria-label="ความก้าวหน้าการเรียน"
            value={learningProgress.percentage}
            color="primary"
            className="max-w-full"
          />
        </BaseCard>

        <BaseCard className="bg-secondary-50/60 dark:bg-secondary-500/10">
          <div className="flex items-center gap-2 text-secondary-600">
            <Trophy size={20} />
            <h2 className="font-medium">ผลคะแนนแบบทดสอบ</h2>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-semibold">{quizPerformance.totalCompleted}</p>
              <p className="text-xs text-default-500">แบบทดสอบที่ทำแล้ว</p>
            </div>
            <div>
              <p className={`text-2xl font-semibold ${SCORE_COLOR(quizPerformance.averageScore)}`}>
                {quizPerformance.averageScore}
              </p>
              <p className="text-xs text-default-500">คะแนนเฉลี่ย</p>
            </div>
            <div>
              <p
                className={`text-2xl font-semibold ${
                  quizPerformance.latestScore !== null ? SCORE_COLOR(quizPerformance.latestScore) : ""
                }`}
              >
                {quizPerformance.latestScore ?? "-"}
              </p>
              <p className="text-xs text-default-500">คะแนนล่าสุด</p>
            </div>
          </div>
        </BaseCard>
      </div>

      {continueLearning && (
        <Link href={`/lessons/${continueLearning.lessonId}`}>
          <BaseCard className="bg-gradient-to-r from-primary-50 to-secondary-50 transition-colors hover:from-primary-100 hover:to-secondary-100 dark:from-primary-500/10 dark:to-secondary-500/10 dark:hover:from-primary-500/15 dark:hover:to-secondary-500/15">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/15 p-2 text-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs text-default-500">เรียนต่อ</p>
                  <h3 className="font-medium">{continueLearning.title}</h3>
                </div>
              </div>
              <ArrowRight size={18} className="text-default-400" />
            </div>
          </BaseCard>
        </Link>
      )}

      <BaseCard>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-default-500" />
          <h2 className="font-medium">แบบทดสอบล่าสุด</h2>
        </div>
        {recentQuizzes.length === 0 ? (
          <p className="text-sm text-default-400">ยังไม่มีประวัติการทำแบบทดสอบ</p>
        ) : (
          <div className="space-y-2">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-lg bg-default-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{quiz.title}</p>
                  <p className="text-xs text-default-400">
                    {dayjs(quiz.completedAt).format("DD MMM YYYY HH:mm")}
                  </p>
                </div>
                <span className={`text-lg font-semibold ${SCORE_COLOR(quiz.score)}`}>
                  {quiz.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </BaseCard>
    </div>
  );
}
