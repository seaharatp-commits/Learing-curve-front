"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from "@heroui/react";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { useKnowledgeBaseMutations } from "@/hooks/knowledgeBase";
import type { KnowledgeBaseFormValues, KnowledgeBaseItem } from "@/types/app/knowledgeBase";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  data?: KnowledgeBaseItem;
  onClose: () => void;
  onSaved?: (title: string) => void;
}

const EMPTY_FORM: KnowledgeBaseFormValues = { title: "", category: "", content: "" };

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
  return "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

function validateForm(form: KnowledgeBaseFormValues) {
  if (!form.title.trim()) return "กรุณาระบุหัวข้อ";
  if (!form.category.trim()) return "กรุณาระบุหมวดหมู่";
  if (!form.content.trim()) return "กรุณาระบุเนื้อหา";
  return "";
}

export default function KnowledgeBaseModal({ isOpen, data, onClose, onSaved }: KnowledgeBaseModalProps) {
  const [form, setForm] = useState<KnowledgeBaseFormValues>(EMPTY_FORM);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const { updateMutation } = useKnowledgeBaseMutations();

  useEffect(() => {
    if (!isOpen) return;
    if (data) {
      setForm({ title: data.title, category: data.category, content: data.content });
    } else {
      setForm(EMPTY_FORM);
    }
    setMessage(null);
  }, [isOpen, data]);

  const handleSave = async () => {
    if (!data) return;
    const validationMessage = validateForm(form);
    if (validationMessage) {
      setMessage({ text: validationMessage, isError: true });
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      content: form.content.trim(),
    };

    try {
      await updateMutation.mutateAsync({ id: data.id, payload });
      onSaved?.(payload.title);
      onClose();
    } catch (error) {
      setMessage({ text: extractErrorMessage(error), isError: true });
    }
  };

  const isSaveDisabled = Boolean(validateForm(form)) || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>แก้ไขความรู้</ModalHeader>
        <ModalBody className="flex flex-col gap-3">
          {message && (
            <p className={`rounded-lg px-3 py-2 text-sm ${message.isError ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700"}`}>
              {message.text}
            </p>
          )}
          <BaseInput
            name="title"
            label="หัวข้อ"
            value={form.title}
            onValueChange={(v) => setForm((p) => ({ ...p, title: v }))}
            isInvalid={!form.title.trim()}
            errorMessage={!form.title.trim() ? "กรุณาระบุหัวข้อ" : undefined}
            isRequired
          />
          <BaseInput
            name="category"
            label="หมวดหมู่"
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            isInvalid={!form.category.trim()}
            errorMessage={!form.category.trim() ? "กรุณาระบุหมวดหมู่" : undefined}
            isRequired
          />
          <Textarea
            name="content"
            label="เนื้อหา"
            minRows={4}
            value={form.content}
            onValueChange={(v) => setForm((p) => ({ ...p, content: v }))}
            isInvalid={!form.content.trim()}
            errorMessage={!form.content.trim() ? "กรุณาระบุเนื้อหา" : undefined}
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <BaseButton variant="light" onPress={onClose}>
            ยกเลิก
          </BaseButton>
          <BaseButton isLoading={updateMutation.isPending} isDisabled={isSaveDisabled} onPress={handleSave}>
            บันทึก
          </BaseButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
