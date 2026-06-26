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
}

const EMPTY_FORM: KnowledgeBaseFormValues = { title: "", category: "", content: "" };

export default function KnowledgeBaseModal({ isOpen, data, onClose }: KnowledgeBaseModalProps) {
  const [form, setForm] = useState<KnowledgeBaseFormValues>(EMPTY_FORM);
  const { updateMutation } = useKnowledgeBaseMutations();

  useEffect(() => {
    if (!isOpen) return;
    if (data) {
      setForm({ title: data.title, category: data.category, content: data.content });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, data]);

  const handleSave = async () => {
    if (!data) return;
    await updateMutation.mutateAsync({ id: data.id, payload: form });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>แก้ไขความรู้</ModalHeader>
        <ModalBody className="flex flex-col gap-3">
          <BaseInput
            name="title"
            label="หัวข้อ"
            value={form.title}
            onValueChange={(v) => setForm((p) => ({ ...p, title: v }))}
            isRequired
          />
          <BaseInput
            name="category"
            label="หมวดหมู่"
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            isRequired
          />
          <Textarea
            name="content"
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
          <BaseButton isLoading={updateMutation.isPending} onPress={handleSave}>
            บันทึก
          </BaseButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
