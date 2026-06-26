"use client";

import { useState } from "react";
import { Select, SelectItem, Textarea } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { useCreateIssue } from "@/hooks/issue";
import { useRecommendations } from "@/hooks/knowledgeBase";
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, DEFAULT_ISSUE_FORM } from "./Report.config";
import type { IssueFormValues } from "@/types/app/issue";

export default function ReportContent() {
  const [form, setForm] = useState<IssueFormValues>(DEFAULT_ISSUE_FORM);
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync, isPending } = useCreateIssue();
  const recommendations = useRecommendations();

  const update = (key: keyof IssueFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync(form);
    setSubmitted(true);
    setForm(DEFAULT_ISSUE_FORM);
    recommendations.reset();
  };

  const handleFindSolutions = () => {
    if (!form.title.trim()) return;
    recommendations.mutate({
      title: form.title,
      description: form.description,
      category: form.category,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">แจ้งปัญหา</h1>
      <BaseCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
          {submitted && (
            <p className="rounded-lg bg-success-100 px-3 py-2 text-sm text-success-700">
              ส่งคำร้องแจ้งปัญหาเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด
            </p>
          )}
          <BaseInput
            label="หัวข้อปัญหา"
            value={form.title}
            onValueChange={(v) => update("title", v)}
            isRequired
          />
          <Textarea
            label="รายละเอียดปัญหา"
            value={form.description}
            onValueChange={(v) => update("description", v)}
            isRequired
            minRows={4}
          />
          <div className="flex gap-3">
            <Select
              label="หมวดหมู่"
              selectedKeys={[form.category]}
              onSelectionChange={(keys) => update("category", Array.from(keys)[0] as string)}
            >
              {ISSUE_CATEGORIES.map((c) => (
                <SelectItem key={c}>{c}</SelectItem>
              ))}
            </Select>
            <Select
              label="ระดับความสำคัญ"
              selectedKeys={[form.priority]}
              onSelectionChange={(keys) => update("priority", Array.from(keys)[0] as string)}
            >
              {ISSUE_PRIORITIES.map((p) => (
                <SelectItem key={p}>{p}</SelectItem>
              ))}
            </Select>
          </div>

          <BaseButton
            type="button"
            variant="flat"
            startContent={<Sparkles size={16} />}
            isLoading={recommendations.isPending}
            isDisabled={!form.title.trim()}
            onPress={handleFindSolutions}
          >
            ค้นหาวิธีแก้ที่อาจตรงกับปัญหานี้
          </BaseButton>

          {recommendations.isSuccess && recommendations.data.length === 0 && (
            <p className="text-sm text-default-400">ยังไม่พบวิธีแก้ที่ตรงกันในฐานความรู้</p>
          )}

          {recommendations.isSuccess && recommendations.data.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-default-600">
                พบวิธีแก้ที่อาจช่วยได้ {recommendations.data.length} รายการ
              </p>
              {recommendations.data.map((rec) => (
                <div key={rec.articleId} className="rounded-lg bg-default-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{rec.title}</span>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                      ความมั่นใจ {Math.round(rec.confidenceScore * 100)}%
                    </span>
                  </div>
                  {rec.resolution && rec.resolution !== "ไม่ระบุ" && (
                    <p className="mt-1 text-default-600">วิธีแก้: {rec.resolution}</p>
                  )}
                  <p className="mt-1 text-xs text-default-400">{rec.explanation}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <BaseInput
              label="ชื่อผู้แจ้ง"
              value={form.reporterName}
              onValueChange={(v) => update("reporterName", v)}
              isRequired
            />
            <BaseInput
              label="อีเมลผู้แจ้ง"
              type="email"
              value={form.reporterEmail}
              onValueChange={(v) => update("reporterEmail", v)}
              isRequired
            />
          </div>
          <BaseButton type="submit" isLoading={isPending} className="w-full">
            ส่งคำร้อง
          </BaseButton>
        </form>
      </BaseCard>
    </div>
  );
}
