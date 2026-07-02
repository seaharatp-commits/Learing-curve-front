"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { ArrowRight, ClipboardList, Trash2 } from "lucide-react";
import { useDeleteQuiz, useQuizList } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";

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
  const { data, isLoading } = useQuizList();
  const deleteQuizMutation = useDeleteQuiz();
  const [deletingQuiz, setDeletingQuiz] = useState<{ id: string; title: string } | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );

  const handleConfirmDelete = () => {
    if (!deletingQuiz) return;
    setDeletingQuizId(deletingQuiz.id);
    setDeleteMessage(null);
    deleteQuizMutation.mutate(deletingQuiz.id, {
      onSuccess: () => {
        setDeletingQuiz(null);
      },
      onError: (error) => {
        setDeleteMessage({ text: extractErrorMessage(error), isError: true });
        setDeletingQuiz(null);
      },
      onSettled: () => setDeletingQuizId(null),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">แบบทดสอบ</h1>
        <p className="text-sm text-default-500">
          แบบทดสอบสำหรับบทเรียนและการประเมินผลของคุณ
        </p>
      </div>

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
              <div className="flex items-center justify-between gap-3">
                <BaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  title="ลบแบบทดสอบถาวร"
                  isLoading={deletingQuizId === quiz.id}
                  onPress={() => setDeletingQuiz({ id: quiz.id, title: quiz.title })}
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
      <Modal isOpen={!!deletingQuiz} onClose={() => setDeletingQuiz(null)}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบแบบทดสอบ</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบนี้? การลบนี้ไม่สามารถย้อนกลับได้
            </p>
            {deletingQuiz && <p className="font-medium">{deletingQuiz.title}</p>}
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setDeletingQuiz(null)}>
              ยกเลิก
            </BaseButton>
            <BaseButton color="danger" isLoading={deleteQuizMutation.isPending} onPress={handleConfirmDelete}>
              ลบแบบทดสอบ
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
