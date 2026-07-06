"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BrainCircuit, Pencil, Plus, Save } from "lucide-react";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";
import {
  useAdminSkillRadarEvents,
  useAdminSkillRadarMutations,
  useAdminSkillRadarPositions,
} from "@/hooks/skillRadar";
import type {
  AdminSkillScoreEvent,
  AdminSkillRadarPosition,
  PositionPayload,
  PositionSkillPayload,
  SkillRadarSkill,
} from "@/types/app/skillRadar";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

const emptyPositionForm: PositionPayload = { name: "", description: "", isActive: true };
const emptySkillForm: PositionSkillPayload = {
  name: "",
  description: "",
  keywords: [],
  weight: 1,
  isActive: true,
};

function keywordsToText(keywords?: string[]) {
  return (keywords ?? []).join(", ");
}

function textToKeywords(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSourceType(sourceType: string) {
  if (sourceType === "QUIZ_ATTEMPT") return "Quiz";
  if (sourceType === "AI_CHAT_QUESTION") return "AI Chat";
  return sourceType;
}

function formatConfidence(confidence: number | null) {
  if (confidence === null || confidence === undefined) return "-";
  return `${Math.round(confidence * 100)}%`;
}

function SkillEvidenceItem({ event }: { event: AdminSkillScoreEvent }) {
  return (
    <div className="rounded-lg bg-default-50 p-3 text-sm dark:bg-default-100/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">
            {event.skill.name} <span className="text-default-400">/ {event.position.name}</span>
          </p>
          <p className="text-xs text-default-500">
            {event.user.name || event.user.email} · {formatEventDate(event.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
            {formatSourceType(event.sourceType)}
          </span>
          <span className="rounded-md bg-success/10 px-2 py-1 text-success-700">
            +{event.scoreDelta}
          </span>
          <span className="rounded-md bg-default-100 px-2 py-1 text-default-600">
            confidence {formatConfidence(event.confidence)}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-default-500">
        score {Math.round(event.scoreBefore)} → {Math.round(event.scoreAfter)}
      </p>
      {event.reason && <p className="mt-2 text-xs text-default-600">{event.reason}</p>}
    </div>
  );
}

export default function AdminSkillRadarContent() {
  const { data: positions, isLoading, isError, error } = useAdminSkillRadarPositions();
  const {
    data: events,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = useAdminSkillRadarEvents(30);
  const {
    createPositionMutation,
    updatePositionMutation,
    createSkillMutation,
    updateSkillMutation,
  } = useAdminSkillRadarMutations();
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<AdminSkillRadarPosition | null>(null);
  const [positionForm, setPositionForm] = useState<PositionPayload>(emptyPositionForm);
  const [editingSkill, setEditingSkill] = useState<SkillRadarSkill | null>(null);
  const [skillForm, setSkillForm] = useState<PositionSkillPayload>(emptySkillForm);
  const [skillKeywordsText, setSkillKeywordsText] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const selectedPosition = useMemo(
    () => positions.find((position) => position.id === selectedPositionId) ?? positions[0] ?? null,
    [positions, selectedPositionId],
  );

  useEffect(() => {
    if (!selectedPositionId && positions.length > 0) {
      setSelectedPositionId(positions[0].id);
    }
  }, [positions, selectedPositionId]);

  const resetPositionForm = () => {
    setEditingPosition(null);
    setPositionForm(emptyPositionForm);
  };

  const resetSkillForm = () => {
    setEditingSkill(null);
    setSkillForm(emptySkillForm);
    setSkillKeywordsText("");
  };

  const startEditPosition = (position: AdminSkillRadarPosition) => {
    setEditingPosition(position);
    setPositionForm({
      name: position.name,
      description: position.description ?? "",
      isActive: position.isActive,
    });
  };

  const startEditSkill = (skill: SkillRadarSkill) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      description: skill.description ?? "",
      keywords: skill.keywords,
      weight: skill.weight,
      isActive: skill.isActive,
    });
    setSkillKeywordsText(keywordsToText(skill.keywords));
  };

  const handleSavePosition = () => {
    const payload = {
      ...positionForm,
      name: positionForm.name.trim(),
      description: positionForm.description?.trim(),
    };

    if (!payload.name) {
      setMessage({ text: "กรุณาระบุชื่อ Position", isError: true });
      return;
    }

    setMessage(null);
    const options = {
      onSuccess: (savedPosition: AdminSkillRadarPosition) => {
        setSelectedPositionId(savedPosition.id);
        setMessage({ text: "บันทึก Position สำเร็จ", isError: false });
        resetPositionForm();
      },
      onError: (error: unknown) => {
        setMessage({ text: getErrorMessage(error, "บันทึก Position ไม่สำเร็จ"), isError: true });
      },
    };

    if (editingPosition) {
      updatePositionMutation.mutate(
        {
          id: editingPosition.id,
          payload,
        },
        options,
      );
    } else {
      createPositionMutation.mutate(payload, options);
    }
  };

  const handleSaveSkill = () => {
    if (!selectedPosition) return;
    const payload = {
      ...skillForm,
      name: skillForm.name.trim(),
      description: skillForm.description?.trim(),
      keywords: textToKeywords(skillKeywordsText),
      weight: Number(skillForm.weight ?? 1),
    };

    if (!payload.name) {
      setMessage({ text: "กรุณาระบุชื่อ Skill", isError: true });
      return;
    }

    setMessage(null);
    const options = {
      onSuccess: () => {
        setMessage({ text: "บันทึก Skill สำเร็จ", isError: false });
        resetSkillForm();
      },
      onError: (error: unknown) => {
        setMessage({ text: getErrorMessage(error, "บันทึก Skill ไม่สำเร็จ"), isError: true });
      },
    };

    if (editingSkill) {
      updateSkillMutation.mutate({ id: editingSkill.id, payload }, options);
    } else {
      createSkillMutation.mutate({ positionId: selectedPosition.id, payload }, options);
    }
  };

  const isSavingPosition = createPositionMutation.isPending || updatePositionMutation.isPending;
  const isSavingSkill = createSkillMutation.isPending || updateSkillMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Skill Radar</h1>
          <p className="text-sm text-default-500">จัดการ Position และ Skill สำหรับ Radar Chart</p>
        </div>
        <BaseButton startContent={<Plus size={16} />} onPress={resetPositionForm}>
          เพิ่ม Position
        </BaseButton>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            message.isError
              ? "border-danger-300 bg-danger-50 text-danger-700"
              : "border-success-300 bg-success-50 text-success-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <BaseCard>
          <p className="text-sm text-default-500">กำลังโหลด Skill Radar...</p>
        </BaseCard>
      ) : isError ? (
        <BaseCard>
          <p className="text-sm text-danger-600">
            {getErrorMessage(error, "โหลดข้อมูล Skill Radar ไม่สำเร็จ")}
          </p>
        </BaseCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <BaseCard>
              <div className="mb-3 flex items-center gap-2">
                <BrainCircuit size={18} className="text-primary" />
                <h2 className="font-medium">Positions</h2>
              </div>
              <div className="space-y-2">
                {positions.map((position) => (
                  <button
                    key={position.id}
                    type="button"
                    onClick={() => setSelectedPositionId(position.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedPosition?.id === position.id
                        ? "bg-primary/15 text-primary"
                        : "bg-default-50 hover:bg-default-100 dark:bg-default-100/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{position.name}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs ${
                          position.isActive
                            ? "bg-success/15 text-success-700"
                            : "bg-default-100 text-default-500"
                        }`}
                      >
                        {position.isActive ? "Active" : "Off"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-default-500">{position.skills.length} skills</p>
                  </button>
                ))}
              </div>
            </BaseCard>

            <BaseCard className="space-y-3">
              <h2 className="font-medium">{editingPosition ? "แก้ไข Position" : "เพิ่ม Position"}</h2>
              <BaseInput
                label="ชื่อ Position"
                value={positionForm.name}
                onValueChange={(name) => setPositionForm((prev) => ({ ...prev, name }))}
              />
              <BaseInput
                label="คำอธิบาย"
                value={positionForm.description ?? ""}
                onValueChange={(description) =>
                  setPositionForm((prev) => ({ ...prev, description }))
                }
              />
              <label className="flex items-center gap-2 text-sm text-default-600">
                <input
                  type="checkbox"
                  checked={positionForm.isActive ?? true}
                  onChange={(event) =>
                    setPositionForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                เปิดใช้งาน
              </label>
              <div className="flex gap-2">
                <BaseButton
                  startContent={<Save size={16} />}
                  isLoading={isSavingPosition}
                  onPress={handleSavePosition}
                >
                  บันทึก
                </BaseButton>
                {editingPosition && (
                  <BaseButton variant="flat" onPress={resetPositionForm}>
                    ยกเลิก
                  </BaseButton>
                )}
              </div>
            </BaseCard>
          </div>

          <div className="space-y-4">
            <BaseCard>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium">{selectedPosition?.name ?? "Skills"}</h2>
                  <p className="text-sm text-default-500">
                    {selectedPosition?.description ?? "เลือก Position เพื่อจัดการ Skills"}
                  </p>
                </div>
                {selectedPosition && (
                  <BaseButton size="sm" variant="flat" onPress={resetSkillForm}>
                    เพิ่ม Skill
                  </BaseButton>
                )}
              </div>

              {selectedPosition && selectedPosition.skills.length === 0 ? (
                <p className="text-sm text-default-500">ยังไม่มี Skill ใน Position นี้</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedPosition?.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-lg bg-default-50 p-3 dark:bg-default-100/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-default-500">weight {skill.weight}</p>
                        </div>
                        <BaseButton
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => startEditSkill(skill)}
                        >
                          <Pencil size={14} />
                        </BaseButton>
                      </div>
                      {skill.description && (
                        <p className="mt-2 text-sm text-default-600">{skill.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skill.keywords.slice(0, 8).map((keyword) => (
                          <span
                            key={`${skill.id}-${keyword}`}
                            className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <p className={`mt-2 text-xs ${skill.isActive ? "text-success-600" : "text-default-400"}`}>
                        {skill.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </BaseCard>

            {selectedPosition && (
              <BaseCard className="space-y-3">
                <h2 className="font-medium">{editingSkill ? "แก้ไข Skill" : "เพิ่ม Skill"}</h2>
                <BaseInput
                  label="ชื่อ Skill"
                  value={skillForm.name}
                  onValueChange={(name) => setSkillForm((prev) => ({ ...prev, name }))}
                />
                <BaseInput
                  label="คำอธิบาย"
                  value={skillForm.description ?? ""}
                  onValueChange={(description) =>
                    setSkillForm((prev) => ({ ...prev, description }))
                  }
                />
                <BaseInput
                  label="Keywords"
                  placeholder="api, database, auth"
                  value={skillKeywordsText}
                  onValueChange={setSkillKeywordsText}
                />
                <BaseInput
                  label="Weight"
                  type="number"
                  value={String(skillForm.weight ?? 1)}
                  onValueChange={(weight) =>
                    setSkillForm((prev) => ({ ...prev, weight: Number(weight) }))
                  }
                />
                <label className="flex items-center gap-2 text-sm text-default-600">
                  <input
                    type="checkbox"
                    checked={skillForm.isActive ?? true}
                    onChange={(event) =>
                      setSkillForm((prev) => ({ ...prev, isActive: event.target.checked }))
                    }
                  />
                  เปิดใช้งาน
                </label>
                <div className="flex gap-2">
                  <BaseButton
                    startContent={<Save size={16} />}
                    isLoading={isSavingSkill}
                    onPress={handleSaveSkill}
                  >
                    บันทึก Skill
                  </BaseButton>
                  {editingSkill && (
                    <BaseButton variant="flat" onPress={resetSkillForm}>
                      ยกเลิก
                    </BaseButton>
                  )}
                </div>
              </BaseCard>
            )}
          </div>
        </div>
      )}

      <BaseCard>
        <div className="mb-3 flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <div>
            <h2 className="font-medium">Recent Skill Evidence</h2>
            <p className="text-sm text-default-500">
              à¸”à¸¹à¸§à¹ˆà¸²à¸„à¸°à¹à¸™à¸™ Skill à¸¥à¹ˆà¸²à¸ªà¸¸à¸”à¸¡à¸²à¸ˆà¸²à¸ Quiz à¸«à¸£à¸·à¸­ AI Chat à¹ƒà¸”
            </p>
          </div>
        </div>

        {isEventsLoading ? (
          <p className="text-sm text-default-500">à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸” evidence...</p>
        ) : isEventsError ? (
          <p className="text-sm text-danger-600">
            {getErrorMessage(eventsError, "à¹‚à¸«à¸¥à¸” evidence à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ")}
          </p>
        ) : events.length === 0 ? (
          <p className="text-sm text-default-500">
            à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µ evidence à¸ªà¸³à¸«à¸£à¸±à¸š Skill Radar à¸¥à¸­à¸‡à¸—à¸³ quiz à¸«à¸£à¸·à¸­à¸–à¸²à¸¡ AI Chat à¸à¹ˆà¸­à¸™à¸„à¸£à¸±à¸š
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <SkillEvidenceItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </BaseCard>
    </div>
  );
}
