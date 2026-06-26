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
}

const PLACEHOLDER =
  "อธิบายความรู้ ปัญหา วิธีแก้ไข หรือประสบการณ์ของคุณให้ละเอียดที่สุด " +
  "AI จะจัดระเบียบให้เป็นบทความฐานความรู้ที่มีโครงสร้างให้เอง";

export default function AddKnowledgeModal({ isOpen, onClose }: AddKnowledgeModalProps) {
  const [step, setStep] = useState<"input" | "review">("input");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<KnowledgeDraft | null>(null);
  const [similarArticles, setSimilarArticles] = useState<RecommendationResult[]>([]);
  const [targetArticleId, setTargetArticleId] = useState<string | null>(null);

  const generateMutation = useGenerateKnowledge();
  const confirmMutation = useConfirmKnowledge();

  useEffect(() => {
    if (!isOpen) return;
    setStep("input");
    setText("");
    setDraft(null);
    setSimilarArticles([]);
    setTargetArticleId(null);
  }, [isOpen]);

  const runGenerate = () => {
    if (text.trim().length < 10) return;
    generateMutation.mutate(text, {
      onSuccess: (result) => {
        setDraft(result.draft);
        setSimilarArticles(result.similarArticles);
        setTargetArticleId(null);
        setStep("review");
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
    await confirmMutation.mutateAsync({
      ...draft,
      originalText: text,
      targetArticleId: targetArticleId ?? undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={step === "review" ? "2xl" : "lg"} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{step === "input" ? "เพิ่มความรู้ใหม่" : "ตรวจสอบความรู้ที่ AI สร้าง"}</ModalHeader>

        {step === "input" && (
          <>
            <ModalBody>
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
                isRequired
              />
              <BaseInput
                label="หมวดหมู่"
                value={draft.category}
                onValueChange={(v) => updateDraft("category", v)}
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
              {/* <BaseInput
                label="สภาพแวดล้อม"
                value={draft.environment}
                onValueChange={(v) => updateDraft("environment", v)}
              /> */}
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
              {/* <BaseInput
                label="คำสำคัญ (คั่นด้วยจุลภาค)"
                value={draft.keywords.join(", ")}
                onValueChange={(v) => updateListField("keywords", v)}
              />
              <BaseInput
                label="แท็ก (คั่นด้วยจุลภาค)"
                value={draft.tags.join(", ")}
                onValueChange={(v) => updateListField("tags", v)}
              /> */}
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
              <BaseButton isLoading={confirmMutation.isPending} onPress={handleConfirm}>
                ยืนยันบันทึก
              </BaseButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
