"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Sparkles, X } from "lucide-react";
import {
  useAdminSkillRadarPositions,
  useSetQuestionSkillMappings,
  useSuggestQuestionSkillMappings,
} from "@/hooks/skillRadar";
import { BaseButton } from "@/components/ui/Button";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";
import type { QuizForAttempt } from "@/types/app/learning";

interface AdminQuestionSkillMappingPanelProps {
  quizId: string;
  question: QuizForAttempt["questions"][number];
}

export function AdminQuestionSkillMappingPanel({
  quizId,
  question,
}: AdminQuestionSkillMappingPanelProps) {
  const { data: skillPositions } = useAdminSkillRadarPositions(true);
  const setQuestionSkillsMutation = useSetQuestionSkillMappings(quizId);
  const suggestQuestionSkillsMutation = useSuggestQuestionSkillMappings();
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    setSelectedSkillIds((question.skillMappings ?? []).map((mapping) => mapping.skillId));
    setMessage(null);
  }, [question.id, question.skillMappings]);

  const allSkills = useMemo(
    () =>
      skillPositions.flatMap((position) =>
        position.skills.map((skill) => ({
          ...skill,
          positionName: position.name,
        })),
      ),
    [skillPositions],
  );

  const selectedSkills = useMemo(() => {
    const selectedIds = new Set(selectedSkillIds);
    return allSkills.filter((skill) => selectedIds.has(skill.id));
  }, [allSkills, selectedSkillIds]);

  const handleAddSkill = (skillId: string) => {
    if (!skillId) return;
    setMessage(null);
    setSelectedSkillIds((current) => (current.includes(skillId) ? current : [...current, skillId]));
  };

  const handleRemoveSkill = (skillId: string) => {
    setMessage(null);
    setSelectedSkillIds((current) => current.filter((id) => id !== skillId));
  };

  const handleSave = () => {
    setIsSaving(true);
    setMessage(null);

    setQuestionSkillsMutation.mutate(
      {
        questionId: question.id,
        mappings: selectedSkillIds.map((skillId) => ({ skillId, weight: 1 })),
      },
      {
        onSuccess: () => {
          setMessage({ text: "บันทึก Skill mapping สำเร็จ", isError: false });
        },
        onError: (error) => {
          setMessage({
            text: getErrorMessage(error, "บันทึก Skill mapping ไม่สำเร็จ"),
            isError: true,
          });
        },
        onSettled: () => setIsSaving(false),
      },
    );
  };

  const handleSuggest = () => {
    setIsSuggesting(true);
    setMessage(null);

    suggestQuestionSkillsMutation.mutate(question.id, {
      onSuccess: (suggestions) => {
        if (suggestions.length === 0) {
          setMessage({
            text: "ยังไม่พบ Skill ที่เข้ากับคำถามนี้ ลองเลือกเองจากรายการ",
            isError: true,
          });
          return;
        }

        const suggestedSkillIds = suggestions.map((suggestion) => suggestion.skillId);
        setSelectedSkillIds((current) => Array.from(new Set([...current, ...suggestedSkillIds])));
        setMessage({
          text: `แนะนำ ${suggestions.length} Skill แล้ว กรุณาตรวจสอบก่อนกดบันทึก`,
          isError: false,
        });
      },
      onError: (error) => {
        setMessage({
          text: getErrorMessage(error, "แนะนำ Skill ไม่สำเร็จ"),
          isError: true,
        });
      },
      onSettled: () => setIsSuggesting(false),
    });
  };

  return (
    <div className="mt-4 rounded-lg border border-default-200 bg-default-50 p-3 dark:border-default-100/20 dark:bg-default-100/10">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Skill mapping</p>
          <p className="text-xs text-default-500">
            ผูกคำถามนี้กับ Skill เพื่อให้คะแนน Quiz ส่งเข้า Skill Radar
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BaseButton
            size="sm"
            variant="flat"
            startContent={<Sparkles size={14} />}
            isLoading={isSuggesting}
            onPress={handleSuggest}
          >
            แนะนำ Skill
          </BaseButton>
          <BaseButton
            size="sm"
            startContent={<Save size={14} />}
            isLoading={isSaving}
            onPress={handleSave}
          >
            บันทึก
          </BaseButton>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {selectedSkills.length === 0 ? (
          <span className="text-xs text-default-500">ยังไม่ได้ผูก Skill</span>
        ) : (
          selectedSkills.map((skill) => (
            <span
              key={`${question.id}-${skill.id}`}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
            >
              {skill.name}
              <span className="text-primary/60">/ {skill.positionName}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill.id)}
                className="rounded p-0.5 hover:bg-primary/10"
                aria-label={`Remove ${skill.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>

      <select
        value=""
        onChange={(event) => handleAddSkill(event.target.value)}
        className="h-9 w-full rounded-lg border border-default-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-primary dark:border-default-100/20 dark:bg-default-50/10"
      >
        <option value="">เพิ่ม Skill...</option>
        {skillPositions.map((position) => (
          <optgroup key={position.id} label={position.name}>
            {position.skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {message && (
        <p className={`mt-2 text-xs ${message.isError ? "text-danger-600" : "text-success-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default AdminQuestionSkillMappingPanel;
