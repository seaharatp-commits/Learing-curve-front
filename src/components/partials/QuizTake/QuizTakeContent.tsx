"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { ArrowLeft, CheckCircle2, Eye, Save, Sparkles, X, XCircle } from "lucide-react";
import { useQuiz, useQuizAttempts, useSubmitQuizAttempt } from "@/hooks/learning";
import {
  useAdminSkillRadarPositions,
  useSetQuestionSkillMappings,
  useSuggestQuestionSkillMappings,
} from "@/hooks/skillRadar";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import type { QuizAttemptHistoryItem, QuizAttemptResult } from "@/types/app/learning";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

const OPTION_LABELS = ["ก", "ข", "ค", "ง"];
const ATTEMPTS_PER_PAGE = 8;

interface QuizTakeContentProps {
  quizId: string;
}

export default function QuizTakeContent({ quizId }: QuizTakeContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { data: quiz, isLoading, isError, error } = useQuiz(quizId);
  const { data: skillPositions } = useAdminSkillRadarPositions(isAdmin);
  const {
    data: attemptHistory = [],
    isLoading: isAttemptsLoading,
    isError: isAttemptsError,
    error: attemptsError,
  } = useQuizAttempts(quizId);
  const submitMutation = useSubmitQuizAttempt(quizId);
  const setQuestionSkillsMutation = useSetQuestionSkillMappings(quizId);
  const suggestQuestionSkillsMutation = useSuggestQuestionSkillMappings();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttemptHistoryItem | null>(null);
  const [attemptPage, setAttemptPage] = useState(1);
  const [skillMappingState, setSkillMappingState] = useState<Record<string, string[]>>({});
  const [skillMappingMessage, setSkillMappingMessage] = useState<
    Record<string, { text: string; isError: boolean } | undefined>
  >({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [suggestingQuestionId, setSuggestingQuestionId] = useState<string | null>(null);

  const allSkills = useMemo(
    () =>
      skillPositions.flatMap((position) =>
        position.skills.map((skill) => ({
          ...skill,
          positionName: position.name,
        })),
      ),
    [skillPositions],
  );

  useEffect(() => {
    if (!quiz) return;
    setSkillMappingState(
      Object.fromEntries(
        quiz.questions.map((question) => [
          question.id,
          (question.skillMappings ?? []).map((mapping) => mapping.skillId),
        ]),
      ),
    );
  }, [quiz]);

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
          <p className="text-sm text-danger-600">
            {getErrorMessage(error, "โหลดแบบทดสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
          </p>
        </BaseCard>
      </div>
    );
  }

  if (isLoading || !quiz) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-default-400">กำลังโหลดแบบทดสอบ...</p>
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => selections[q.id] !== undefined);
  const resultByQuestionId = new Map(result?.answers.map((a) => [a.questionId, a]) ?? []);

  const getSelectedSkills = (questionId: string) => {
    const selectedSkillIds = new Set(skillMappingState[questionId] ?? []);
    return allSkills.filter((skill) => selectedSkillIds.has(skill.id));
  };

  const handleAddQuestionSkill = (questionId: string, skillId: string) => {
    if (!skillId) return;
    setSkillMappingMessage((prev) => ({ ...prev, [questionId]: undefined }));
    setSkillMappingState((prev) => {
      const current = prev[questionId] ?? [];
      if (current.includes(skillId)) return prev;
      return { ...prev, [questionId]: [...current, skillId] };
    });
  };

  const handleRemoveQuestionSkill = (questionId: string, skillId: string) => {
    setSkillMappingMessage((prev) => ({ ...prev, [questionId]: undefined }));
    setSkillMappingState((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] ?? []).filter((id) => id !== skillId),
    }));
  };

  const handleSaveQuestionSkills = (questionId: string) => {
    const selectedSkillIds = skillMappingState[questionId] ?? [];
    setSavingQuestionId(questionId);
    setSkillMappingMessage((prev) => ({ ...prev, [questionId]: undefined }));

    setQuestionSkillsMutation.mutate(
      {
        questionId,
        mappings: selectedSkillIds.map((skillId) => ({ skillId, weight: 1 })),
      },
      {
        onSuccess: () => {
          setSkillMappingMessage((prev) => ({
            ...prev,
            [questionId]: { text: "บันทึก Skill mapping สำเร็จ", isError: false },
          }));
        },
        onError: (error) => {
          setSkillMappingMessage((prev) => ({
            ...prev,
            [questionId]: {
              text: getErrorMessage(error, "บันทึก Skill mapping ไม่สำเร็จ"),
              isError: true,
            },
          }));
        },
        onSettled: () => setSavingQuestionId(null),
      },
    );
  };

  const handleSuggestQuestionSkills = (questionId: string) => {
    setSuggestingQuestionId(questionId);
    setSkillMappingMessage((prev) => ({ ...prev, [questionId]: undefined }));

    suggestQuestionSkillsMutation.mutate(questionId, {
      onSuccess: (suggestions) => {
        if (suggestions.length === 0) {
          setSkillMappingMessage((prev) => ({
            ...prev,
            [questionId]: {
              text: "ยังไม่พบ Skill ที่เข้ากับคำถามนี้ ลองเลือกเองจากรายการ",
              isError: true,
            },
          }));
          return;
        }

        const suggestedSkillIds = suggestions.map((suggestion) => suggestion.skillId);
        setSkillMappingState((prev) => ({
          ...prev,
          [questionId]: Array.from(new Set([...(prev[questionId] ?? []), ...suggestedSkillIds])),
        }));
        setSkillMappingMessage((prev) => ({
          ...prev,
          [questionId]: {
            text: `แนะนำ ${suggestions.length} Skill แล้ว กรุณาตรวจสอบก่อนกดบันทึก`,
            isError: false,
          },
        }));
      },
      onError: (error) => {
        setSkillMappingMessage((prev) => ({
          ...prev,
          [questionId]: {
            text: getErrorMessage(error, "แนะนำ Skill ไม่สำเร็จ"),
            isError: true,
          },
        }));
      },
      onSettled: () => setSuggestingQuestionId(null),
    });
  };

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
      <div className="mb-3">
        <h2 className="text-base font-semibold">ประวัติการทำแบบทดสอบ</h2>
        <p className="text-xs text-default-500">คลิกแต่ละครั้งเพื่อดูคำตอบย้อนหลัง</p>
      </div>

      {isAttemptsLoading ? (
        <p className="text-sm text-default-500">กำลังโหลดประวัติ...</p>
      ) : isAttemptsError ? (
        <p className="text-sm text-danger-600">
          {getErrorMessage(attemptsError, "โหลดประวัติการทำแบบทดสอบไม่สำเร็จ")}
        </p>
      ) : attemptHistory.length === 0 ? (
        <div className="rounded-lg border border-dashed border-default-200 p-3 text-sm text-default-500">
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
                  className="w-full rounded-lg bg-default-50 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-default-100/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">ครั้งที่ {attemptNumber}</p>
                    <span className="text-base font-semibold text-primary">{attempt.score}</span>
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
          <div>
            <h1 className="text-2xl font-semibold">{quiz.title}</h1>
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
                <BaseCard key={question.id}>
                  <p className="mb-3 font-medium">
                    {idx + 1}. {question.questionText}
                  </p>
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
                          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${stateClass}`}
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
                    <div className="mt-4 rounded-lg border border-default-200 bg-default-50 p-3 dark:border-default-100/20 dark:bg-default-100/10">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">Skill mapping</p>
                          <p className="text-xs text-default-500">
                            ผูกคำถามนี้กับ Skill เพื่อให้คะแนน Quiz ส่งเข้า Skill Radar
                          </p>
                        </div>
                        <BaseButton
                          size="sm"
                          variant="flat"
                          startContent={<Sparkles size={14} />}
                          isLoading={suggestingQuestionId === question.id}
                          onPress={() => handleSuggestQuestionSkills(question.id)}
                        >
                          แนะนำ Skill
                        </BaseButton>
                        <BaseButton
                          size="sm"
                          startContent={<Save size={14} />}
                          isLoading={savingQuestionId === question.id}
                          onPress={() => handleSaveQuestionSkills(question.id)}
                        >
                          บันทึก
                        </BaseButton>
                      </div>

                      <div className="mb-2 flex flex-wrap gap-2">
                        {getSelectedSkills(question.id).length === 0 ? (
                          <span className="text-xs text-default-500">ยังไม่ได้ผูก Skill</span>
                        ) : (
                          getSelectedSkills(question.id).map((skill) => (
                            <span
                              key={`${question.id}-${skill.id}`}
                              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                              {skill.name}
                              <span className="text-primary/60">/ {skill.positionName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionSkill(question.id, skill.id)}
                                className="rounded p-0.5 hover:bg-primary/10"
                                aria-label={`Remove ${skill.name}`}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <select
                        value=""
                        onChange={(event) => handleAddQuestionSkill(question.id, event.target.value)}
                        className="h-9 w-full rounded-lg border border-default-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-primary dark:border-default-100/20 dark:bg-default-50/10"
                      >
                        <option value="">เพิ่ม Skill...</option>
                        {skillPositions.map((position) => (
                          <optgroup key={position.id} label={position.name}>
                            {position.skills.map((skill) => (
                              <option key={skill.id} value={skill.id}>
                                {skill.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      {skillMappingMessage[question.id] && (
                        <p
                          className={`mt-2 text-xs ${
                            skillMappingMessage[question.id]?.isError
                              ? "text-danger-600"
                              : "text-success-600"
                          }`}
                        >
                          {skillMappingMessage[question.id]?.text}
                        </p>
                      )}
                    </div>
                  )}
                </BaseCard>
              );
            })}
          </div>

          {!result && (
            <div className="space-y-2">
              {submitError && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">
                  {submitError}
                </p>
              )}
              <BaseButton
                isDisabled={!allAnswered}
                isLoading={submitMutation.isPending}
                onPress={handleSubmit}
              >
                ส่งคำตอบ
              </BaseButton>
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
