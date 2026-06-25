"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from "@heroui/react";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { useKnowledgeBaseMutations } from "@/hooks/knowledgeBase";
import type { KnowledgeBaseFormValues, KnowledgeBaseItem, ModalMode } from "@/types/app/knowledgeBase";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  mode: ModalMode;
  data?: KnowledgeBaseItem;
  onClose: () => void;
}

const EMPTY_FORM: KnowledgeBaseFormValues = { title: "", category: "", content: "" };

export default function KnowledgeBaseModal({ isOpen, mode, data, onClose }: KnowledgeBaseModalProps) {
  const [form, setForm] = useState<KnowledgeBaseFormValues>(EMPTY_FORM);
  const { createMutation, updateMutation } = useKnowledgeBaseMutations();

  useEffect(() => {
    if (data) {
      setForm({ title: data.title, category: data.category, content: data.content });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [data]);

  const handleSave = async () => {
    if (mode === "edit" && data) {
      await updateMutation.mutateAsync({ id: data.id, payload: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{mode === "edit" ? "แก้ไขความรู้" : "เพิ่มความรู้ใหม่"}</ModalHeader>
        <ModalBody className="flex flex-col gap-3">
          <BaseInput
            label="หัวข้อ"
            value={form.title}
            onValueChange={(v) => setForm((p) => ({ ...p, title: v }))}
            isRequired
          />
          <BaseInput
            label="หมวดหมู่"
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            isRequired
          />
          <Textarea
            label="เนื้อหา"
            minRows={4}
            value={form.content}
            onValueChange={(v) => setForm((p) => ({ ...p, content: v }))}
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <BaseButton variant="light" onPress={onClose}>
            ยกเลิก
          </BaseButton>
          <BaseButton isLoading={isLoading} onPress={handleSave}>
            บันทึก
          </BaseButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
