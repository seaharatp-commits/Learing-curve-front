"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useQuiz, useSubmitQuizAttempt } from "@/hooks/learning";
import { BaseCard } from "@/components/ui/Card";
import { BaseButton } from "@/components/ui/Button";
import type { QuizAttemptResult } from "@/types/app/learning";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

const OPTION_LABELS = ["ก", "ข", "ค", "ง"];

interface QuizTakeContentProps {
  quizId: string;
}

export default function QuizTakeContent({ quizId }: QuizTakeContentProps) {
  const router = useRouter();
  const { data: quiz, isLoading } = useQuiz(quizId);
  const submitMutation = useSubmitQuizAttempt(quizId);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading || !quiz) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-default-400">กำลังโหลดแบบทดสอบ...</p>
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => selections[q.id] !== undefined);

  const handleSubmit = () => {
    setSubmitError(null);
    submitMutation.mutate(
      quiz.questions.map((q) => ({ questionId: q.id, selectedIndex: selections[q.id] })),
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => setSubmitError(getErrorMessage(error, "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")),
      },
    );
  };

  const resultByQuestionId = new Map(result?.answers.map((a) => [a.questionId, a]) ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => router.push("/quizzes")}
        className="flex items-center gap-1 text-sm text-default-500 hover:text-default-700"
      >
        <ArrowLeft size={16} />
        กลับไปยังรายการแบบทดสอบ
      </button>

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
    </div>
  );
}
