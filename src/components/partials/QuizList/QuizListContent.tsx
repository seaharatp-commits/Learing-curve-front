"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { ArrowRight, ClipboardList, Trash2 } from "lucide-react";
import { useDeleteQuiz, useQuizList } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

export default function QuizListContent() {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuizList();
  const { data: session } = useSession();
  const deleteQuizMutation = useDeleteQuiz();
  const [deletingQuiz, setDeletingQuiz] = useState<{ id: string; title: string } | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  );
  const isAdmin = session?.user?.role === "ADMIN";

  const handleConfirmDelete = () => {
    if (!deletingQuiz) return;
    setDeletingQuizId(deletingQuiz.id);
    setDeleteMessage(null);
    deleteQuizMutation.mutate(deletingQuiz.id, {
      onSuccess: () => {
        setDeletingQuiz(null);
      },
      onError: (error) => {
        setDeleteMessage({ text: getErrorMessage(error), isError: true });
        setDeletingQuiz(null);
      },
      onSettled: () => setDeletingQuizId(null),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">Practice & assessment</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">แบบทดสอบ</h1>
            <p className="mt-1 max-w-2xl text-sm text-default-500">
          แบบทดสอบสำหรับบทเรียนและการประเมินผลของคุณ
            </p>
          </div>
          {!isLoading && !isError && data.length > 0 && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {data.length} แบบทดสอบ
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดแบบทดสอบ">
          {Array.from({ length: 3 }, (_, index) => (
            <BaseCard key={index} className="h-[92px] animate-pulse bg-default-100/60 dark:bg-default-100/10" />
          ))}
        </div>
      )}

      {isError && (
        <BaseCard>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-danger-600">
              {getErrorMessage(error, "โหลดรายการแบบทดสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
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
      )}

      {!isLoading && !isError && data.length === 0 && (
        <BaseCard className="border-dashed">
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <span className="rounded-2xl bg-primary/10 p-3 text-primary">
              <ClipboardList size={26} />
            </span>
            <div>
              <p className="font-medium">ยังไม่มีแบบทดสอบ</p>
              <p className="mt-1 text-sm text-default-500">เริ่มจากสร้างบทเรียน แล้วสร้างแบบทดสอบเพื่อทบทวนความรู้</p>
            </div>
          </div>
        </BaseCard>
      )}

      <div className="space-y-3">
        {!isError && data.map((quiz) => (
          <BaseCard
            key={quiz.id}
            className="group transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-50/35 hover:shadow-md dark:hover:bg-primary-500/10"
          >
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Link href={`/quizzes/${quiz.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-xl bg-primary/15 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                    <ClipboardList size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-semibold leading-6">{quiz.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-default-500">
                      <span className="rounded-full bg-default-100 px-2 py-0.5 dark:bg-default-100/10">
                        {quiz.questionCount} คำถาม
                      </span>
                      {quiz.sourceArticleTitle && (
                        <span className="max-w-full truncate rounded-full bg-default-100 px-2 py-0.5 dark:bg-default-100/10">
                          จาก {quiz.sourceArticleTitle}
                        </span>
                      )}
                    </div>
                    {isAdmin && quiz.createdByEmail && (
                      <p className="mt-1 truncate text-xs text-default-400">
                        สร้างโดย {quiz.createdByName ?? quiz.createdByEmail} ({quiz.createdByEmail})
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
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
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <span className="hidden sm:inline">เริ่มทำ</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </BaseCard>
        ))}
      </div>
      {deleteMessage && (
        <p
          role="alert"
          className={`rounded-lg px-3 py-2 text-xs ${
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
