"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { useDeleteQuiz, useGenerateQuizFromTopic, useQuizList } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";

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
  return "ดำเนินการไม่สำเร็จ ลองใหม่อีกครั้ง";
}

export default function QuizListContent() {
  const router = useRouter();
  const { data, isLoading } = useQuizList();
  const generateTopicMutation = useGenerateQuizFromTopic();
  const deleteQuizMutation = useDeleteQuiz();
  const [topic, setTopic] = useState("");
  const [topicMessage, setTopicMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );

  const handleGenerateTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTopic = topic.trim();
    if (cleanTopic.length < 2) {
      setTopicMessage({ text: "กรุณาพิมพ์หัวข้ออย่างน้อย 2 ตัวอักษร", isError: true });
      return;
    }

    setTopicMessage(null);
    generateTopicMutation.mutate(cleanTopic, {
      onSuccess: (result) => {
        setTopic("");
        router.push(`/lessons/${result.lessonId}`);
      },
      onError: (error) => {
        setTopicMessage({ text: extractErrorMessage(error), isError: true });
      },
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    const confirmed = window.confirm("ต้องการลบแบบทดสอบนี้ใช่ไหม?");
    if (!confirmed) return;

    setDeletingQuizId(quizId);
    setDeleteMessage(null);
    deleteQuizMutation.mutate(quizId, {
      onError: (error) => {
        setDeleteMessage({ text: extractErrorMessage(error), isError: true });
      },
      onSettled: () => setDeletingQuizId(null),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">แบบทดสอบ</h1>
        <p className="text-sm text-default-500">
          แบบทดสอบปรนัยที่สร้างจากบทความในฐานความรู้ ลองทำเพื่อทดสอบความเข้าใจของคุณ
        </p>
      </div>

      <BaseCard className="bg-primary-50/60 dark:bg-primary-500/10">
        <form onSubmit={handleGenerateTopic} className="flex flex-col gap-3 sm:flex-row">
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
            isLoading={generateTopicMutation.isPending}
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

      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}

      {!isLoading && data.length === 0 && (
        <BaseCard>
          <p className="text-sm text-default-400">ยังไม่มีแบบทดสอบในระบบ</p>
        </BaseCard>
      )}

      <div className="space-y-3">
        {data.map((quiz) => (
          <BaseCard
            key={quiz.id}
            className="transition-colors hover:bg-default-50 dark:hover:bg-default-100/10"
          >
            <div className="flex items-center justify-between gap-4">
              <Link href={`/quizzes/${quiz.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-full bg-primary/15 p-2 text-primary">
                    <ClipboardList size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{quiz.title}</h3>
                    <p className="text-xs text-default-500">
                      {quiz.questionCount} คำถาม
                      {quiz.sourceArticleTitle ? ` · จากบทความ "${quiz.sourceArticleTitle}"` : ""}
                      {quiz.createdByEmail
                        ? ` · สร้างโดย ${quiz.createdByName ?? quiz.createdByEmail} (${quiz.createdByEmail})`
                        : " · ไม่ทราบผู้สร้าง"}
                    </p>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between gap-4">
                <BaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  title="ลบแบบทดสอบ"
                  isLoading={deletingQuizId === quiz.id}
                  onPress={() => handleDeleteQuiz(quiz.id)}
                >
                  <Trash2 size={16} />
                </BaseButton>
                <Link href={`/quizzes/${quiz.id}`}>
                  <ArrowRight size={18} className="text-default-400" />
                </Link>
              </div>
            </div>
          </BaseCard>
        ))}
      </div>
      {deleteMessage && (
        <p
          className={`text-xs ${
            deleteMessage.isError ? "text-danger-600" : "text-success-600"
          }`}
        >
          {deleteMessage.text}
        </p>
      )}
    </div>
  );
}
