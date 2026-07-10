"use client";

import { useState, type FormEvent } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from "@heroui/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useDeleteLesson, useGenerateLessonFromTopic, useLearningDashboard } from "@/hooks/learning";
import {
  useCareerAlignment,
  useMySkillRadar,
  useSkillRadarPositions,
  useUpdateMySkillRadarPosition,
} from "@/hooks/skillRadar";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";
import type { LearningLessonItem } from "@/types/app/learning";
import { CareerAlignmentCard } from "./CareerAlignmentCard";
import SkillRadarCard from "./SkillRadarCard";

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

export default function LearningDashboardContent() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useLearningDashboard();
  const {
    data: skillRadar,
    isLoading: isSkillRadarLoading,
    isError: isSkillRadarError,
    error: skillRadarError,
  } = useMySkillRadar();
  const {
    data: skillRadarPositions,
    isLoading: isSkillRadarPositionsLoading,
  } = useSkillRadarPositions();
  const {
    data: careerAlignment,
    isLoading: isCareerAlignmentLoading,
    isError: isCareerAlignmentError,
    error: careerAlignmentError,
  } = useCareerAlignment();
  const updateSkillRadarPositionMutation = useUpdateMySkillRadarPosition();
  const generateLessonMutation = useGenerateLessonFromTopic();
  const deleteLessonMutation = useDeleteLesson();
  const [topic, setTopic] = useState("");
  const [lessonPage, setLessonPage] = useState(1);
  const [topicMessage, setTopicMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );
  const [skillRadarMessage, setSkillRadarMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );
  const [lessonToDelete, setLessonToDelete] = useState<LearningLessonItem | null>(null);
  const [lessonMessage, setLessonMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleLessonMenuAction = (key: React.Key, lesson: LearningLessonItem) => {
    if (key === "start") {
      router.push(`/lessons/${lesson.lessonId}`);
      return;
    }
    if (key === "edit") {
      // TODO: no dedicated lesson-edit page exists yet — route to the lesson view for now.
      router.push(`/lessons/${lesson.lessonId}`);
      return;
    }
    if (key === "delete") {
      setLessonMessage(null);
      setLessonToDelete(lesson);
    }
  };

  const handleConfirmDeleteLesson = () => {
    if (!lessonToDelete) return;
    const lesson = lessonToDelete;
    deleteLessonMutation.mutate(lesson.lessonId, {
      onSuccess: () => {
        setLessonToDelete(null);
        setLessonMessage({ text: `ลบบทเรียน "${lesson.title}" สำเร็จแล้ว`, isError: false });
      },
      onError: (error) => {
        setLessonMessage({
          text: getErrorMessage(error, "ลบบทเรียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"),
          isError: true,
        });
      },
    });
  };

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
          setTopicMessage({ text: getErrorMessage(error, "สร้างบทเรียนไม่สำเร็จ ลองใหม่อีกครั้ง"), isError: true });
        },
      },
    );
  };

  const handleChangeSkillRadarPosition = (positionId: string) => {
    if (!positionId || positionId === skillRadar?.position.id) return;

    setSkillRadarMessage(null);
    updateSkillRadarPositionMutation.mutate(positionId, {
      onSuccess: (radar) => {
        setSkillRadarMessage({
          text: `บันทึก Position เป็น ${radar.position.name} แล้ว`,
          isError: false,
        });
      },
      onError: (error) => {
        setSkillRadarMessage({
          text: getErrorMessage(error, "บันทึก Position ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"),
          isError: true,
        });
      },
    });
  };

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl">
        <BaseCard>
          <p className="text-sm text-danger-600">
            {getErrorMessage(error, "โหลดแดชบอร์ดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
          </p>
        </BaseCard>
      </div>
    );
  }

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
  const latestRecentQuizzes = [...recentQuizzes]
    .sort((a, b) => dayjs(b.completedAt).valueOf() - dayjs(a.completedAt).valueOf())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-9">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ดการเรียนรู้</h1>
        <p className="text-sm text-default-500">
          ภาพรวมความก้าวหน้าและผลคะแนนแบบทดสอบของคุณ
        </p>
      </div>

      <BaseCard className="border-primary/20 bg-primary-50/75 p-2 shadow-md shadow-primary/5 dark:bg-primary-500/10">
        <form onSubmit={handleGenerateLesson} className="flex flex-col gap-4 md:flex-row md:items-end md:gap-5">
          <BaseInput
            label="อยากเรียนเรื่องอะไร?"
            placeholder="พิมพ์เรื่องที่อยากเรียน เช่น Next.js, Docker, UX/UI"
            value={topic}
            onValueChange={setTopic}
            size="lg"
            className="min-w-0 flex-1"
            classNames={{
              inputWrapper: "min-h-14 rounded-xl px-5",
              input: "text-sm leading-7 text-foreground placeholder:text-default-400",
              label: "pb-1.5 text-sm font-semibold text-foreground",
            }}
          />
          <BaseButton
            type="submit"
            size="lg"
            startContent={<Sparkles size={16} />}
            isLoading={generateLessonMutation.isPending}
            className="h-14 w-full shrink-0 rounded-xl px-5 md:w-[160px]"
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

      <div className="grid gap-5 md:grid-cols-2">
        <BaseCard className="bg-primary-50/60 dark:bg-primary-500/10">
          <div className="flex items-center gap-2 text-primary-600">
            <GraduationCap size={20} />
            <h2 className="font-medium">ความก้าวหน้าในการเรียน</h2>
          </div>
          <p className="mt-4 text-5xl font-semibold tracking-tight">{learningProgress.percentage}%</p>
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
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-4xl font-semibold tracking-tight">{quizPerformance.totalCompleted}</p>
              <p className="text-xs text-default-500">แบบทดสอบที่ทำแล้ว</p>
            </div>
            <div>
              <p className={`text-4xl font-semibold tracking-tight ${SCORE_COLOR(quizPerformance.averageScore)}`}>
                {quizPerformance.averageScore}
              </p>
              <p className="text-xs text-default-500">คะแนนเฉลี่ย</p>
            </div>
            <div>
              <p
                className={`text-4xl font-semibold tracking-tight ${
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

      {isCareerAlignmentLoading ? (
        <BaseCard>
          <p className="text-sm text-default-400">กำลังโหลด Career Alignment...</p>
        </BaseCard>
      ) : isCareerAlignmentError ? (
        <BaseCard>
          <p className="text-sm text-danger-600">
            {getErrorMessage(careerAlignmentError, "โหลด Career Alignment ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
          </p>
        </BaseCard>
      ) : careerAlignment ? (
        <CareerAlignmentCard
          level={careerAlignment.level}
          alignmentScore={careerAlignment.alignmentScore}
          strengths={careerAlignment.strengths.length > 0 ? careerAlignment.strengths : undefined}
          description={careerAlignment.description}
          quotes={careerAlignment.quotes}
        />
      ) : null}

      <SkillRadarCard
        data={skillRadar}
        isLoading={isSkillRadarLoading}
        isError={isSkillRadarError}
        error={skillRadarError}
        positions={skillRadarPositions}
        isPositionsLoading={isSkillRadarPositionsLoading}
        isSavingPosition={updateSkillRadarPositionMutation.isPending}
        positionMessage={skillRadarMessage}
        onChangePosition={handleChangeSkillRadarPosition}
      />

      <BaseCard className="space-y-1">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-default-500" />
          <h2 className="font-medium">เลือกบทเรียนที่จะเรียนต่อ</h2>
        </div>
        {lessonMessage && (
          <p
            className={`mb-2 text-xs ${lessonMessage.isError ? "text-danger-600" : "text-success-600"}`}
          >
            {lessonMessage.text}
          </p>
        )}
        {lessons.length === 0 ? (
          <p className="text-sm text-default-400">
            ยังไม่มีบทเรียน สร้างหัวข้อแรกจากช่องด้านบนได้เลย
          </p>
        ) : (
          <>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleLessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="group relative rounded-xl border border-default-200/80 bg-default-50/90 transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/5 hover:shadow-md dark:border-default-100/15 dark:bg-default-100/10 dark:hover:bg-primary/10"
              >
                <Link
                  href={`/lessons/${lesson.lessonId}`}
                  className="block cursor-pointer px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3 pr-7">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{lesson.title}</p>
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
                    <div className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-medium text-primary opacity-90 transition-transform group-hover:translate-x-0.5">
                      <span>เริ่มเรียน</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>

                <div className="absolute right-2 top-2">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <button
                        type="button"
                        aria-label="ตัวเลือกบทเรียน"
                        className="rounded-md p-1 text-default-400 opacity-60 transition-colors hover:bg-default-200/70 hover:text-default-600 hover:opacity-100 dark:hover:bg-default-100/20"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="ตัวเลือกบทเรียน"
                      onAction={(key) => handleLessonMenuAction(key, lesson)}
                    >
                      <DropdownItem key="start" startContent={<PlayCircle size={16} />}>
                        เริ่มเรียน
                      </DropdownItem>
                      <DropdownItem key="edit" startContent={<Pencil size={16} />}>
                        แก้ไข
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 size={16} />}
                      >
                        ลบบทเรียน
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
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
        {latestRecentQuizzes.length === 0 ? (
          <p className="text-sm text-default-400">ยังไม่มีประวัติการทำแบบทดสอบ</p>
        ) : (
          <div className="space-y-3">
            {latestRecentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-default-200/70 bg-default-50 px-4 py-3 dark:border-default-100/15 dark:bg-default-100/10"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{quiz.title}</p>
                  <p className="text-xs text-default-400">
                    {dayjs(quiz.completedAt).format("DD MMM YYYY HH:mm")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-3 py-1 text-xl font-semibold ${
                    quiz.score >= 80
                      ? "bg-success/15 text-success-600"
                      : quiz.score >= 60
                        ? "bg-warning/15 text-warning-600"
                        : "bg-danger/15 text-danger-600"
                  }`}
                >
                  {quiz.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </BaseCard>

      <Modal isOpen={!!lessonToDelete} onClose={() => setLessonToDelete(null)}>
        <ModalContent>
          <ModalHeader>ลบบทเรียนนี้?</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              คุณต้องการลบบทเรียนนี้หรือไม่ การลบนี้ไม่สามารถย้อนกลับได้
            </p>
            {lessonToDelete && <p className="font-medium">{lessonToDelete.title}</p>}
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setLessonToDelete(null)}>
              ยกเลิก
            </BaseButton>
            <BaseButton
              color="danger"
              isLoading={deleteLessonMutation.isPending}
              onPress={handleConfirmDeleteLesson}
            >
              ลบบทเรียน
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
