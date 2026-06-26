"use client";

import dayjs from "dayjs";
import { Progress } from "@heroui/react";
import { useLearningDashboard } from "@/hooks/learning";
import { BaseCard } from "@/components/ui/Card";
import { GraduationCap, Trophy, TrendingUp, ArrowRight, BookOpen } from "lucide-react";

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-success-600";
  if (score >= 60) return "text-warning-600";
  return "text-danger-600";
};

export default function LearningDashboardContent() {
  const { data, isLoading } = useLearningDashboard();

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
        <p className="text-sm text-default-500">ภาพรวมความก้าวหน้าและผลคะแนนแบบทดสอบของคุณ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Learning Progress */}
        <BaseCard className="bg-primary-50/60 dark:bg-primary-500/10">
          <div className="flex items-center gap-2 text-primary-600">
            <GraduationCap size={20} />
            <h2 className="font-medium">ความก้าวหน้าในการเรียน</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold">{learningProgress.percentage}%</p>
          <p className="mb-2 text-sm text-default-500">
            เรียนจบแล้ว {learningProgress.completedLessons} จาก {learningProgress.totalLessons} บทเรียน
          </p>
          <Progress
            aria-label="ความก้าวหน้าการเรียน"
            value={learningProgress.percentage}
            color="primary"
            className="max-w-full"
          />
        </BaseCard>

        {/* Quiz Performance */}
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
                {quizPerformance.latestScore ?? "—"}
              </p>
              <p className="text-xs text-default-500">คะแนนล่าสุด</p>
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Continue Learning */}
      {continueLearning && (
        <BaseCard className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-500/10 dark:to-secondary-500/10">
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
      )}

      {/* Recent Quiz */}
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
