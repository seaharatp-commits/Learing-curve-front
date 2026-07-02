"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { useGenerateKnowledge, useKnowledgeBaseMutations } from "@/hooks/knowledgeBase";
import type { KnowledgeBaseFormValues, KnowledgeBaseItem } from "@/types/app/knowledgeBase";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  data?: KnowledgeBaseItem;
  onClose: () => void;
  onSaved?: (title: string) => void;
}

const EMPTY_FORM: KnowledgeBaseFormValues = {
  title: "",
  category: "",
  content: "",
  summary: "",
  keywords: [],
  tags: [],
};

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
  const [keywordsText, setKeywordsText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const { updateMutation } = useKnowledgeBaseMutations();
  const generateMutation = useGenerateKnowledge();

  useEffect(() => {
    if (!isOpen) return;
    if (data) {
      setForm({
        title: data.title,
        category: data.category,
        content: data.content,
        summary: data.summary ?? "",
        keywords: data.keywords ?? [],
        tags: data.tags ?? [],
      });
      setKeywordsText((data.keywords ?? []).join(", "));
      setTagsText((data.tags ?? []).join(", "));
    } else {
      setForm(EMPTY_FORM);
      setKeywordsText("");
      setTagsText("");
    }
    setMessage(null);
  }, [isOpen, data]);

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleGenerateMetadata = () => {
    const source = [form.title, form.category, form.summary, form.content].filter(Boolean).join("\n\n");
    if (source.trim().length < 10) {
      setMessage({ text: "กรุณาระบุหัวข้อหรือเนื้อหาก่อนให้ AI ช่วยสร้าง metadata", isError: true });
      return;
    }

    setMessage(null);
    generateMutation.mutate(source, {
      onSuccess: (result) => {
        setForm((prev) => ({
          ...prev,
          summary: result.draft.summary,
          keywords: result.draft.keywords,
          tags: result.draft.tags,
        }));
        setKeywordsText(result.draft.keywords.join(", "));
        setTagsText(result.draft.tags.join(", "));
        setMessage({ text: "AI เติม summary, keywords และ tags ให้แล้ว กรุณาตรวจสอบก่อนบันทึก", isError: false });
      },
      onError: (error) => {
        setMessage({ text: extractErrorMessage(error), isError: true });
      },
    });
  };

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
      summary: form.summary?.trim() ?? "",
      keywords: parseList(keywordsText),
      tags: parseList(tagsText),
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
          <Textarea
            name="summary"
            label="สรุปสั้น ๆ"
            minRows={2}
            value={form.summary ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, summary: v }))}
            description="ช่วยให้ AI Chat จับคู่คำถามกับฐานความรู้ได้แม่นขึ้น"
          />
          <BaseInput
            name="keywords"
            label="Keywords"
            value={keywordsText}
            onValueChange={setKeywordsText}
            placeholder="เช่น merge workflow, deploy, permission"
            description="คั่นแต่ละคำด้วยเครื่องหมาย comma"
          />
          <BaseInput
            name="tags"
            label="Tags"
            value={tagsText}
            onValueChange={setTagsText}
            placeholder="เช่น workflow, backend"
            description="คั่นแต่ละ tag ด้วยเครื่องหมาย comma"
          />
        </ModalBody>
        <ModalFooter>
          <BaseButton variant="light" onPress={onClose}>
            ยกเลิก
          </BaseButton>
          <BaseButton
            variant="flat"
            startContent={<Sparkles size={14} />}
            isLoading={generateMutation.isPending}
            onPress={handleGenerateMetadata}
          >
            ให้ AI เติม metadata
          </BaseButton>
          <BaseButton isLoading={updateMutation.isPending} isDisabled={isSaveDisabled} onPress={handleSave}>
            บันทึก
          </BaseButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
