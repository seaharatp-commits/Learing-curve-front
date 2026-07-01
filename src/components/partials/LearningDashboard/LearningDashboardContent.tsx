"use client";

import { useState, type FormEvent } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Progress } from "@heroui/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useGenerateLessonFromTopic, useLearningDashboard } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";

const LESSONS_PER_PAGE = 6;
const MAX_VISIBLE_PAGE_BUTTONS = 7;

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-success-600";
  if (score >= 60) return "text-warning-600";
  return "text-danger-600";
};

function getLessonPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) items.push("ellipsis-start");
  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }
  if (endPage < totalPages - 1) items.push("ellipsis-end");

  items.push(totalPages);
  return items;
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
  return "สร้างบทเรียนไม่สำเร็จ ลองใหม่อีกครั้ง";
}

export default function LearningDashboardContent() {
  const router = useRouter();
  const { data, isLoading } = useLearningDashboard();
  const generateLessonMutation = useGenerateLessonFromTopic();
  const [topic, setTopic] = useState("");
  const [lessonPage, setLessonPage] = useState(1);
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
    generateLessonMutation.mutate(
      { topic: cleanTopic },
      {
        onSuccess: (result) => {
          setTopic("");
          router.push(`/lessons/${result.lessonId}`);
        },
        onError: (error) => {
          setTopicMessage({ text: extractErrorMessage(error), isError: true });
        },
      },
    );
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-default-400">กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  const { learningProgress, quizPerformance, recentQuizzes, lessons } = data;
  const sortedLessons = [...lessons].sort((a, b) => Number(a.completed) - Number(b.completed));
  const totalLessonPages = Math.ceil(sortedLessons.length / LESSONS_PER_PAGE);
  const currentLessonPage = Math.min(lessonPage, Math.max(totalLessonPages, 1));
  const visibleLessons = sortedLessons.slice(
    (currentLessonPage - 1) * LESSONS_PER_PAGE,
    currentLessonPage * LESSONS_PER_PAGE,
  );
  const lessonPaginationItems = getLessonPaginationItems(currentLessonPage, totalLessonPages);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ดการเรียนรู้</h1>
        <p className="text-sm text-default-500">
          ภาพรวมความก้าวหน้าและผลคะแนนแบบทดสอบของคุณ
        </p>
      </div>

      <BaseCard className="bg-primary-50/60 dark:bg-primary-500/10">
        <form onSubmit={handleGenerateLesson} className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <BaseInput
            label="อยากเรียนเรื่องอะไร?"
            placeholder="เช่น การเขียน prompt ให้ชัดเจน"
            value={topic}
            onValueChange={setTopic}
          />
          <BaseButton
            type="submit"
            startContent={<Sparkles size={16} />}
            isLoading={generateLessonMutation.isPending}
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

      <BaseCard>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-default-500" />
          <h2 className="font-medium">เลือกบทเรียนที่จะเรียนต่อ</h2>
        </div>
        {lessons.length === 0 ? (
          <p className="text-sm text-default-400">
            ยังไม่มีบทเรียน สร้างหัวข้อแรกจากช่องด้านบนได้เลย
          </p>
        ) : (
          <>
          <div className="grid gap-3 md:grid-cols-2">
            {visibleLessons.map((lesson) => (
              <Link
                key={lesson.lessonId}
                href={`/lessons/${lesson.lessonId}`}
                className="rounded-lg bg-default-50 px-3 py-3 transition-colors hover:bg-default-100 dark:bg-default-100/10 dark:hover:bg-default-100/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lesson.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-default-500">
                      {lesson.completed ? (
                        <>
                          <CheckCircle2 size={14} className="text-success-600" />
                          เรียนจบแล้ว
                        </>
                      ) : (
                        "ยังไม่จบ"
                      )}
                    </p>
                  </div>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-default-400" />
                </div>
              </Link>
            ))}
          </div>
          {totalLessonPages > 1 && (
            <div className="mt-3 flex flex-wrap justify-end gap-1">
              <button
                type="button"
                disabled={currentLessonPage === 1}
                onClick={() => setLessonPage((page) => Math.max(1, page - 1))}
                className="h-8 rounded-md bg-default-100 px-3 text-sm font-medium text-default-600 transition-colors hover:bg-default-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-default-100/10 dark:text-default-300 dark:hover:bg-default-100/20"
              >
                ก่อนหน้า
              </button>
              {lessonPaginationItems.map((page) =>
                typeof page === "number" ? (
                <button
                  key={page}
                  type="button"
                  onClick={() => setLessonPage(page)}
                  className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium transition-colors ${
                    page === currentLessonPage
                      ? "bg-primary text-primary-foreground"
                      : "bg-default-100 text-default-600 hover:bg-default-200 dark:bg-default-100/10 dark:text-default-300 dark:hover:bg-default-100/20"
                  }`}
                >
                  {page}
                </button>
                ) : (
                  <span
                    key={page}
                    className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-default-400"
                  >
                    ...
                  </span>
                ),
              )}
              <button
                type="button"
                disabled={currentLessonPage === totalLessonPages}
                onClick={() => setLessonPage((page) => Math.min(totalLessonPages, page + 1))}
                className="h-8 rounded-md bg-default-100 px-3 text-sm font-medium text-default-600 transition-colors hover:bg-default-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-default-100/10 dark:text-default-300 dark:hover:bg-default-100/20"
              >
                ถัดไป
              </button>
            </div>
          )}
          </>
        )}
      </BaseCard>

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
