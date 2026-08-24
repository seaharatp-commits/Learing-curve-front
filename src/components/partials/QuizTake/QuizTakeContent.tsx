"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { ArrowLeft, CheckCircle2, ClipboardList, Eye, XCircle } from "lucide-react";
import { useQuiz, useQuizAttempts, useSubmitQuizAttempt } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import type { QuizAttemptHistoryItem, QuizAttemptResult } from "@/types/app/learning";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";
import { AdminQuestionSkillMappingPanel } from "./AdminQuestionSkillMappingPanel";

const OPTION_LABELS = ["ก", "ข", "ค", "ง"];
const ATTEMPTS_PER_PAGE = 8;

interface QuizTakeContentProps {
  quizId: string;
}

export default function QuizTakeContent({ quizId }: QuizTakeContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { data: quiz, isLoading, isFetching, isError, error, refetch } = useQuiz(quizId);
  const {
    data: attemptHistory = [],
    isLoading: isAttemptsLoading,
    isError: isAttemptsError,
    error: attemptsError,
  } = useQuizAttempts(quizId);
  const submitMutation = useSubmitQuizAttempt(quizId);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttemptHistoryItem | null>(null);
  const [attemptPage, setAttemptPage] = useState(1);

  const totalAttemptPages = Math.max(1, Math.ceil(attemptHistory.length / ATTEMPTS_PER_PAGE));
  const currentAttemptPage = Math.min(attemptPage, totalAttemptPages);
  const attemptStartIndex = (currentAttemptPage - 1) * ATTEMPTS_PER_PAGE;
  const visibleAttemptHistory = attemptHistory.slice(attemptStartIndex, attemptStartIndex + ATTEMPTS_PER_PAGE);

  useEffect(() => {
    setAttemptPage(1);
  }, [quizId]);

  useEffect(() => {
    setAttemptPage((page) => Math.min(page, totalAttemptPages));
  }, [totalAttemptPages]);

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <button
          onClick={() => router.push("/quizzes")}
          className="flex items-center gap-1 text-sm text-default-500 hover:text-default-700"
        >
          <ArrowLeft size={16} />
          กลับไปยังรายการแบบทดสอบ
        </button>
        <BaseCard>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-danger-600">
              {getErrorMessage(error, "โหลดแบบทดสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
            </p>
            <BaseButton
              size="sm"
              variant="flat"
              isLoading={isFetching}
              onPress={() => {
                void refetch();
              }}
            >
              ลองใหม่
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    );
  }

  if (isLoading || !quiz) {
    return (
      <div className="mx-auto w-full max-w-[820px] space-y-5" aria-busy="true" aria-label="กำลังโหลดแบบทดสอบ">
        <div className="h-5 w-44 animate-pulse rounded-full bg-default-100 dark:bg-default-100/15" />
        <div className="h-9 w-3/4 max-w-lg animate-pulse rounded-lg bg-default-100 dark:bg-default-100/15" />
        {Array.from({ length: 3 }, (_, index) => (
          <BaseCard key={index} className="h-40 animate-pulse bg-default-100/60 dark:bg-default-100/10" />
        ))}
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => selections[q.id] !== undefined);
  const resultByQuestionId = new Map(result?.answers.map((a) => [a.questionId, a]) ?? []);

  const handleSubmit = () => {
    setSubmitError(null);
    submitMutation.mutate(
      quiz.questions.map((q) => ({ questionId: q.id, selectedIndex: selections[q.id] })),
      {
        onSuccess: (data) => setResult(data),
        onError: (error) =>
          setSubmitError(getErrorMessage(error, "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")),
      },
    );
  };

  const handleRetry = () => {
    setSelections({});
    setResult(null);
    setSubmitError(null);
  };

  const historyPanel = (
    <BaseCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <ClipboardList size={17} />
          </span>
          <div>
            <h2 className="text-base font-semibold">ประวัติการทำแบบทดสอบ</h2>
            <p className="text-xs text-default-500">คลิกแต่ละครั้งเพื่อดูคำตอบย้อนหลัง</p>
          </div>
        </div>
        {attemptHistory.length > 0 && (
          <span className="shrink-0 rounded-full bg-default-100 px-2 py-0.5 text-[11px] text-default-500 dark:bg-default-100/10">
            {attemptHistory.length} ครั้ง
          </span>
        )}
      </div>

      {isAttemptsLoading ? (
        <p className="text-sm text-default-500">กำลังโหลดประวัติ...</p>
      ) : isAttemptsError ? (
        <p className="text-sm text-danger-600">
          {getErrorMessage(attemptsError, "โหลดประวัติการทำแบบทดสอบไม่สำเร็จ")}
        </p>
      ) : attemptHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-default-200 bg-default-50/60 p-4 text-center text-sm text-default-500 dark:border-default-100/15 dark:bg-default-100/5">
           ยังไม่มีประวัติการทำแบบทดสอบนี้
        </div>
      ) : (
        <div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {visibleAttemptHistory.map((attempt, index) => {
              const attemptNumber = attemptHistory.length - (attemptStartIndex + index);

              return (
                <button
                  key={attempt.attemptId}
                  type="button"
                  onClick={() => setSelectedAttempt(attempt)}
                  className="w-full rounded-xl border border-default-200/60 bg-default-50 px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/30 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-default-100/10 dark:bg-default-100/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">ครั้งที่ {attemptNumber}</p>
                    <span
                      className={`text-base font-semibold ${
                        attempt.score >= 80
                          ? "text-success-600"
                          : attempt.score >= 60
                            ? "text-warning-600"
                            : "text-danger-600"
                      }`}
                    >
                      {attempt.score}
                    </span>
                  </div>
                  <p className="text-xs text-default-500">
                    ถูก {attempt.correctCount}/{attempt.totalQuestions} ข้อ
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-default-400">
                    <Eye size={12} />
                    {new Date(attempt.submittedAt).toLocaleString("th-TH")}
                  </p>
                </button>
              );
            })}
          </div>

          {totalAttemptPages > 1 && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-default-200 pt-3 text-xs text-default-500 dark:border-default-100/20">
              <BaseButton
                size="sm"
                variant="flat"
                isDisabled={currentAttemptPage === 1}
                onPress={() => setAttemptPage((page) => Math.max(1, page - 1))}
              >
                ก่อนหน้า
              </BaseButton>
              <span>
                {currentAttemptPage}/{totalAttemptPages}
              </span>
              <BaseButton
                size="sm"
                variant="flat"
                isDisabled={currentAttemptPage === totalAttemptPages}
                onPress={() => setAttemptPage((page) => Math.min(totalAttemptPages, page + 1))}
              >
                ถัดไป
              </BaseButton>
            </div>
          )}
        </div>
      )}
    </BaseCard>
  );

  return (
    <div className="relative mx-auto grid min-h-[calc(100dvh-6.5rem)] w-full max-w-[1508px] grid-cols-1 gap-6 overflow-hidden 2xl:grid-cols-[320px_minmax(0,820px)_320px]">
      <aside className="hidden min-w-0 2xl:block">
        <div className="sticky top-24">{historyPanel}</div>
      </aside>

      <section className="mx-auto flex w-full min-w-0 max-w-[820px] flex-col gap-6 2xl:col-start-2">
      <button
        onClick={() => router.push("/quizzes")}
        className="flex w-fit items-center gap-1 text-sm text-default-500 hover:text-default-700"
      >
        <ArrowLeft size={16} />
        กลับไปยังรายการแบบทดสอบ
      </button>

      <div className="2xl:hidden">{historyPanel}</div>

          <main className="space-y-6">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">
              <ClipboardList size={14} /> แบบทดสอบ
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{quiz.title}</h1>
            <p className="text-sm text-default-500">ทั้งหมด {quiz.questions.length} คำถาม · เลือกคำตอบที่ดีที่สุด</p>
            {result && (
              <p className="mt-1 text-sm text-default-500">
                คุณได้คะแนน{" "}
                <span className="font-semibold text-primary">
                  {result.correctCount}/{result.totalQuestions}
                </span>{" "}
                ({result.score} คะแนน)
              </p>
            )}
          </div>

          {result && (
            <BaseCard className="border-success/30 bg-success/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-success-700">ส่งคำตอบสำเร็จ</p>
                  <p className="text-sm text-default-600">
                    คุณตอบถูก {result.correctCount}/{result.totalQuestions} ข้อ ได้{" "}
                    {result.score} คะแนน
                  </p>
                  <p className="text-xs text-default-500">
                    บันทึก attempt แล้วเมื่อ{" "}
                    {new Date(result.submittedAt).toLocaleString("th-TH")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <BaseButton size="sm" variant="flat" onPress={handleRetry}>
                    ทำใหม่
                  </BaseButton>
                  <BaseButton size="sm" onPress={() => router.push("/quizzes")}>
                    กลับรายการแบบทดสอบ
                  </BaseButton>
                </div>
              </div>
            </BaseCard>
          )}

          <div className="space-y-4">
            {quiz.questions.map((question, idx) => {
              const answer = resultByQuestionId.get(question.id);

              return (
              <BaseCard key={question.id} className="transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 font-medium leading-6">{question.questionText}</p>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optionIdx) => {
                      const isSelected = selections[question.id] === optionIdx;
                      let stateClass = isSelected
                        ? "border-primary bg-primary/10"
                        : "border-default-200 hover:bg-default-50 dark:hover:bg-default-100/10";

                      if (answer) {
                        if (optionIdx === answer.correctIndex) {
                          stateClass = "border-success bg-success/10";
                        } else if (optionIdx === answer.selectedIndex) {
                          stateClass = "border-danger bg-danger/10";
                        } else {
                          stateClass = "border-default-200 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={optionIdx}
                          disabled={!!result}
                          onClick={() => {
                            setSubmitError(null);
                            setSelections((prev) => ({ ...prev, [question.id]: optionIdx }));
                          }}
                          aria-pressed={isSelected}
                          className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-default ${stateClass}`}
                        >
                          <span className="font-medium">{OPTION_LABELS[optionIdx]}.</span>
                          <span className="flex-1">{option}</span>
                          {answer && optionIdx === answer.correctIndex && (
                            <CheckCircle2 size={16} className="text-success" />
                          )}
                          {answer && optionIdx === answer.selectedIndex && !answer.isCorrect && (
                            <XCircle size={16} className="text-danger" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {answer?.explanation && (
                    <p className="mt-3 rounded-lg bg-default-50 p-2 text-xs text-default-500 dark:bg-default-100/10">
                      คำอธิบาย: {answer.explanation}
                    </p>
                  )}
                  {isAdmin && (
                    <AdminQuestionSkillMappingPanel quizId={quizId} question={question} />
                  )}
                </BaseCard>
              );
            })}
          </div>

          {!result && (
            <div className="space-y-2">
              {submitError && (
                <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-500/10 dark:text-danger-300">
                  {submitError}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-default-500">
                  {allAnswered ? "ตรวจสอบคำตอบให้เรียบร้อยก่อนส่ง" : "กรุณาตอบให้ครบทุกข้อก่อนส่งคำตอบ"}
                </p>
                <BaseButton
                  isDisabled={!allAnswered}
                  isLoading={submitMutation.isPending}
                  onPress={handleSubmit}
                  className="w-full sm:w-auto"
                >
                  ส่งคำตอบ
                </BaseButton>
              </div>
            </div>
          )}
        </main>
      </section>

      <Modal
        isOpen={!!selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
        size="2xl"
        scrollBehavior="inside"
        className="w-[92vw] max-w-[760px]"
      >
        <ModalContent>
          <ModalHeader>รายละเอียดการทำแบบทดสอบ</ModalHeader>
          <ModalBody>
            {selectedAttempt && (
              <div className="space-y-4">
                <div className="rounded-lg bg-default-50 p-3 dark:bg-default-100/10">
                  <p className="text-sm text-default-500">แบบทดสอบ</p>
                  <h3 className="text-lg font-semibold">{selectedAttempt.quizTitle}</h3>
                  <div className="mt-2 grid gap-2 text-sm text-default-600 sm:grid-cols-3">
                    <p>วันที่ส่ง: {new Date(selectedAttempt.submittedAt).toLocaleString("th-TH")}</p>
                    <p>คะแนน: {selectedAttempt.score}</p>
                    <p>
                      ถูก {selectedAttempt.correctCount}/{selectedAttempt.totalQuestions} ข้อ
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedAttempt.detailAnswers.map((answer, index) => (
                    <div
                      key={`${selectedAttempt.attemptId}-${answer.questionId}`}
                      className={`rounded-lg border p-3 ${
                        answer.isCorrect
                          ? "border-success/30 bg-success/10"
                          : "border-danger/30 bg-danger/10"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <p className="font-medium">
                          {index + 1}. {answer.questionText || "คำถามนี้ไม่มีข้อมูล"}
                        </p>
                        {answer.isCorrect ? (
                          <CheckCircle2 size={18} className="shrink-0 text-success" />
                        ) : (
                          <XCircle size={18} className="shrink-0 text-danger" />
                        )}
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div className="rounded-md bg-background/70 p-2">
                          <p className="text-xs text-default-500">คำตอบของคุณ</p>
                          <p className={answer.isCorrect ? "text-success-700" : "text-danger-700"}>
                            {answer.selectedAnswer ?? "ไม่ได้ตอบ"}
                          </p>
                        </div>
                        <div className="rounded-md bg-background/70 p-2">
                          <p className="text-xs text-default-500">คำตอบที่ถูก</p>
                          <p className="text-success-700">{answer.correctAnswer ?? "-"}</p>
                        </div>
                      </div>

                      {answer.explanation && (
                        <p className="mt-2 rounded-md bg-background/70 p-2 text-xs text-default-600">
                          คำอธิบาย: {answer.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setSelectedAttempt(null)}>
              ปิด
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
