"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { useKnowledgeBaseList, useKnowledgeBaseMutations } from "@/hooks/knowledgeBase";
import { useGenerateQuiz } from "@/hooks/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { KnowledgeBaseModal, AddKnowledgeModal } from "./Modal";
import type { KnowledgeBaseItem } from "@/types/app/knowledgeBase";

function extractErrorMessage(error: unknown, fallback = "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"): string {
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
  return fallback;
}

export default function KnowledgeBaseContent() {
  const { data, isLoading } = useKnowledgeBaseList();
  const { deleteMutation } = useKnowledgeBaseMutations();
  const generateQuizMutation = useGenerateQuiz();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBaseItem | undefined>();
  const [deleting, setDeleting] = useState<KnowledgeBaseItem | null>(null);
  const [pageMessage, setPageMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [quizResultMessages, setQuizResultMessages] = useState<Record<string, { text: string; isError: boolean }>>(
    {},
  );

  const handleGenerateQuiz = (articleId: string) => {
    setGeneratingId(articleId);
    setPageMessage(null);
    setQuizResultMessages((prev) => ({ ...prev, [articleId]: undefined as never }));
    generateQuizMutation.mutate(articleId, {
      onSuccess: () => {
        setPageMessage({ text: "สร้างแบบทดสอบจากฐานความรู้สำเร็จแล้ว", isError: false });
        setQuizResultMessages((prev) => ({
          ...prev,
          [articleId]: { text: "สร้างแบบทดสอบสำเร็จแล้ว ดูได้ที่หน้า \"แบบทดสอบ\"", isError: false },
        }));
      },
      onError: (error) => {
        const message = extractErrorMessage(error, "สร้างแบบทดสอบไม่สำเร็จ ลองใหม่อีกครั้ง");
        setPageMessage({ text: message, isError: true });
        setQuizResultMessages((prev) => ({
          ...prev,
          [articleId]: { text: message, isError: true },
        }));
      },
      onSettled: () => setGeneratingId(null),
    });
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    setPageMessage(null);
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setPageMessage({ text: `ลบข้อมูล "${deleting.title}" สำเร็จแล้ว`, isError: false });
        setDeleting(null);
      },
      onError: (error) => {
        setPageMessage({
          text: extractErrorMessage(error, "ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"),
          isError: true,
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">จัดการฐานความรู้</h1>
        <BaseButton startContent={<Plus size={16} />} onPress={() => setIsAddOpen(true)}>
          เพิ่มความรู้
        </BaseButton>
      </div>

      {pageMessage && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            pageMessage.isError
              ? "border-danger-300 bg-danger-50 text-danger-700"
              : "border-success-300 bg-success-50 text-success-700"
          }`}
        >
          {pageMessage.text}
        </div>
      )}

      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {data.map((item) => (
          <BaseCard key={item.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  {item.category}
                </span>
                <h3 className="mt-2 font-medium">{item.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-default-500">{item.content}</p>
              </div>
              <div className="flex flex-col gap-1">
                <BaseButton isIconOnly size="sm" variant="light" onPress={() => setEditing(item)}>
                  <Pencil size={14} />
                </BaseButton>
                <BaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="secondary"
                  isLoading={generatingId === item.id}
                  onPress={() => handleGenerateQuiz(item.id)}
                  title="สร้างแบบทดสอบจากบทความนี้"
                >
                  <ClipboardList size={14} />
                </BaseButton>
                <BaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => setDeleting(item)}
                >
                  <Trash2 size={14} />
                </BaseButton>
              </div>
            </div>
            {quizResultMessages[item.id] && (
              <p
                className={`mt-2 text-xs ${
                  quizResultMessages[item.id].isError ? "text-danger-600" : "text-success-600"
                }`}
              >
                {quizResultMessages[item.id].text}
              </p>
            )}
          </BaseCard>
        ))}
      </div>

      <AddKnowledgeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={() => setPageMessage({ text: "บันทึกข้อมูลฐานความรู้สำเร็จแล้ว", isError: false })}
      />
      <KnowledgeBaseModal
        isOpen={!!editing}
        data={editing}
        onClose={() => setEditing(undefined)}
        onSaved={(title) => setPageMessage({ text: `บันทึก "${title}" สำเร็จแล้ว`, isError: false })}
      />
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบข้อมูล</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การลบนี้ไม่สามารถย้อนกลับได้
            </p>
            {deleting && <p className="font-medium">{deleting.title}</p>}
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setDeleting(null)}>
              ยกเลิก
            </BaseButton>
            <BaseButton color="danger" isLoading={deleteMutation.isPending} onPress={handleConfirmDelete}>
              ลบข้อมูล
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
