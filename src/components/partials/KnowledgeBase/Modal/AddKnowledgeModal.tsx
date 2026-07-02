"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from "@heroui/react";
import { Sparkles, RotateCcw } from "lucide-react";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { useGenerateKnowledge, useConfirmKnowledge } from "@/hooks/knowledgeBase";
import type { KnowledgeDraft, RecommendationResult } from "@/types/app/knowledgeBase";

interface AddKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const PLACEHOLDER =
  "อธิบายความรู้ ปัญหา วิธีแก้ไข หรือประสบการณ์ของคุณให้ละเอียดที่สุด " +
  "AI จะจัดระเบียบให้เป็นบทความฐานความรู้ที่มีโครงสร้างให้เอง";

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
  return "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

function getDraftContent(draft: KnowledgeDraft) {
  return [
    draft.summary,
    draft.symptoms,
    draft.rootCause,
    draft.resolution,
    draft.verification,
  ].join(" ").trim();
}

function validateDraft(draft: KnowledgeDraft) {
  if (!draft.title.trim()) return "กรุณาระบุหัวข้อ";
  if (!draft.category.trim()) return "กรุณาระบุหมวดหมู่";
  if (!getDraftContent(draft)) return "กรุณาระบุเนื้อหา";
  return "";
}

export default function AddKnowledgeModal({ isOpen, onClose, onSaved }: AddKnowledgeModalProps) {
  const [step, setStep] = useState<"input" | "review">("input");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<KnowledgeDraft | null>(null);
  const [similarArticles, setSimilarArticles] = useState<RecommendationResult[]>([]);
  const [targetArticleId, setTargetArticleId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const generateMutation = useGenerateKnowledge();
  const confirmMutation = useConfirmKnowledge();

  useEffect(() => {
    if (!isOpen) return;
    setStep("input");
    setText("");
    setDraft(null);
    setSimilarArticles([]);
    setTargetArticleId(null);
    setMessage(null);
  }, [isOpen]);

  const runGenerate = () => {
    if (text.trim().length < 10) {
      setMessage({ text: "กรุณาระบุเนื้อหาอย่างน้อย 10 ตัวอักษร", isError: true });
      return;
    }
    setMessage(null);
    generateMutation.mutate(text, {
      onSuccess: (result) => {
        setDraft(result.draft);
        setSimilarArticles(result.similarArticles);
        setTargetArticleId(null);
        setStep("review");
        setMessage({ text: "AI สร้างร่างฐานความรู้สำเร็จแล้ว กรุณาตรวจสอบก่อนบันทึก", isError: false });
      },
      onError: (error) => {
        setMessage({ text: extractErrorMessage(error), isError: true });
      },
    });
  };

  const updateDraft = (key: keyof KnowledgeDraft, value: string) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateListField = (key: "keywords" | "tags", value: string) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [key]: value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          }
        : prev,
    );

  const handleConfirm = async () => {
    if (!draft) return;
    const validationMessage = validateDraft(draft);
    if (validationMessage) {
      setMessage({ text: validationMessage, isError: true });
      return;
    }

    try {
      await confirmMutation.mutateAsync({
        ...draft,
        title: draft.title.trim(),
        category: draft.category.trim(),
        originalText: text.trim(),
        targetArticleId: targetArticleId ?? undefined,
      });
      onSaved?.();
      onClose();
    } catch (error) {
      setMessage({ text: extractErrorMessage(error), isError: true });
    }
  };

  const isConfirmDisabled = !draft || Boolean(validateDraft(draft)) || confirmMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={step === "review" ? "2xl" : "lg"} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{step === "input" ? "เพิ่มความรู้ใหม่" : "ตรวจสอบความรู้ที่ AI สร้าง"}</ModalHeader>

        {step === "input" && (
          <>
            <ModalBody className="flex flex-col gap-3">
              {message && (
                <p className={`rounded-lg px-3 py-2 text-sm ${message.isError ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700"}`}>
                  {message.text}
                </p>
              )}
              <Textarea
                label="เนื้อหาความรู้"
                placeholder={PLACEHOLDER}
                minRows={10}
                value={text}
                onValueChange={setText}
                isRequired
              />
            </ModalBody>
            <ModalFooter>
              <BaseButton variant="light" onPress={onClose}>
                ยกเลิก
              </BaseButton>
              <BaseButton
                startContent={<Sparkles size={16} />}
                isLoading={generateMutation.isPending}
                isDisabled={text.trim().length < 10}
                onPress={runGenerate}
              >
                สร้างความรู้ด้วย AI
              </BaseButton>
            </ModalFooter>
          </>
        )}

        {step === "review" && draft && (
          <>
            <ModalBody className="flex flex-col gap-4">
              {message && (
                <p className={`rounded-lg px-3 py-2 text-sm ${message.isError ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700"}`}>
                  {message.text}
                </p>
              )}
              <div className="rounded-lg bg-default-50 p-3 text-xs text-default-400">
                <p className="mb-1 font-medium text-default-500">ข้อความต้นฉบับ</p>
                {text}
              </div>

              {similarArticles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-warning-600">
                    พบบทความที่อาจซ้ำกัน {similarArticles.length} รายการ — เลือกเพื่ออัปเดตบทความนั้นแทนการสร้างใหม่
                  </p>
                  {similarArticles.map((article) => {
                    const isSelected = targetArticleId === article.articleId;
                    return (
                      <button
                        key={article.articleId}
                        type="button"
                        onClick={() => setTargetArticleId(isSelected ? null : article.articleId)}
                        className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-default-200 hover:bg-default-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{article.title}</span>
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                            ความมั่นใจ {Math.round(article.confidenceScore * 100)}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-default-400">{article.explanation}</p>
                        {isSelected && (
                          <p className="mt-1 text-xs text-primary">
                            จะอัปเดตบทความนี้แทนการสร้างใหม่
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <BaseInput
                label="หัวข้อ"
                value={draft.title}
                onValueChange={(v) => updateDraft("title", v)}
                isInvalid={!draft.title.trim()}
                errorMessage={!draft.title.trim() ? "กรุณาระบุหัวข้อ" : undefined}
                isRequired
              />
              <BaseInput
                label="หมวดหมู่"
                value={draft.category}
                onValueChange={(v) => updateDraft("category", v)}
                isInvalid={!draft.category.trim()}
                errorMessage={!draft.category.trim() ? "กรุณาระบุหมวดหมู่" : undefined}
                isRequired
              />
              <Textarea
                label="สรุป"
                minRows={2}
                value={draft.summary}
                onValueChange={(v) => updateDraft("summary", v)}
              />
              <Textarea
                label="อาการที่พบ"
                minRows={2}
                value={draft.symptoms}
                onValueChange={(v) => updateDraft("symptoms", v)}
              />
              <Textarea
                label="สาเหตุที่เป็นไปได้"
                minRows={2}
                value={draft.rootCause}
                onValueChange={(v) => updateDraft("rootCause", v)}
              />
              <Textarea
                label="วิธีแก้ไข"
                minRows={2}
                value={draft.resolution}
                onValueChange={(v) => updateDraft("resolution", v)}
              />
              <Textarea
                label="การตรวจสอบผลลัพธ์"
                minRows={2}
                value={draft.verification}
                onValueChange={(v) => updateDraft("verification", v)}
              />
              <BaseInput
                label="Keywords"
                value={draft.keywords.join(", ")}
                onValueChange={(v) => updateListField("keywords", v)}
                placeholder="เช่น merge workflow, deploy, permission"
                description="คั่นแต่ละคำด้วยเครื่องหมาย comma"
              />
              <BaseInput
                label="Tags"
                value={draft.tags.join(", ")}
                onValueChange={(v) => updateListField("tags", v)}
                placeholder="เช่น workflow, backend"
                description="คั่นแต่ละ tag ด้วยเครื่องหมาย comma"
              />
              {!getDraftContent(draft) && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">
                  กรุณาระบุเนื้อหาอย่างน้อยหนึ่งส่วน เช่น สรุป อาการที่พบ สาเหตุ วิธีแก้ไข หรือการตรวจสอบผลลัพธ์
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <BaseButton variant="light" onPress={onClose}>
                ยกเลิก
              </BaseButton>
              <BaseButton
                variant="flat"
                startContent={<RotateCcw size={14} />}
                isLoading={generateMutation.isPending}
                onPress={runGenerate}
              >
                สร้างใหม่อีกครั้ง
              </BaseButton>
              <BaseButton isLoading={confirmMutation.isPending} isDisabled={isConfirmDisabled} onPress={handleConfirm}>
                ยืนยันบันทึก
              </BaseButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
