"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import {
  Activity,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";
import {
  useAdminSkillRadarEvents,
  useAdminSkillRadarMutations,
  useAdminSkillRadarPositions,
  useSuggestPositionSkills,
} from "@/hooks/skillRadar";
import type {
  AdminSkillScoreEvent,
  AdminSkillScoreEventFilters,
  AdminSkillRadarPosition,
  PositionPayload,
  PositionSkillPayload,
  SkillRadarSkill,
} from "@/types/app/skillRadar";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

interface EditableSkillSuggestion {
  name: string;
  description: string;
  keywordsText: string;
}

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
  if (sourceType === "LESSON_COMPLETION") return "Lesson";
  if (sourceType === "LESSON_TOPIC_CREATED") return "Lesson Topic";
  if (sourceType === "LESSON_CHAT_QUESTION") return "Lesson Chat";
  return sourceType;
}

function formatConfidence(confidence: number | null) {
  if (confidence === null || confidence === undefined) return "-";
  return `${Math.round(confidence * 100)}%`;
}

function escapeCsvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function buildEventsCsv(events: AdminSkillScoreEvent[]) {
  const rows = [
    [
      "eventId",
      "user",
      "email",
      "position",
      "skill",
      "sourceType",
      "sourceId",
      "scoreDelta",
      "scoreBefore",
      "scoreAfter",
      "confidence",
      "reason",
      "createdAt",
    ],
    ...events.map((event) => [
      event.id,
      event.user.name ?? "",
      event.user.email,
      event.position.name,
      event.skill.name,
      event.sourceType,
      event.sourceId ?? "",
      event.scoreDelta,
      event.scoreBefore,
      event.scoreAfter,
      event.confidence ?? "",
      event.reason ?? "",
      event.createdAt,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function SkillEvidenceItem({
  event,
  isExpanded,
  onToggle,
}: {
  event: AdminSkillScoreEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
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
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-default-100 px-2 py-1 text-default-600 hover:bg-default-200"
            onClick={onToggle}
          >
            <Eye size={13} />
            debug
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-default-500">
        score {Math.round(event.scoreBefore)} → {Math.round(event.scoreAfter)}
      </p>
      {event.reason && <p className="mt-2 text-xs text-default-600">{event.reason}</p>}
      {isExpanded && (
        <div className="mt-3 grid gap-2 rounded-md border border-default-200 bg-background/60 p-3 text-xs text-default-500 sm:grid-cols-2">
          <p>
            <span className="font-medium text-default-700">Event ID:</span> {event.id}
          </p>
          <p>
            <span className="font-medium text-default-700">User ID:</span> {event.user.id}
          </p>
          <p>
            <span className="font-medium text-default-700">Position ID:</span> {event.position.id}
          </p>
          <p>
            <span className="font-medium text-default-700">Skill ID:</span> {event.skill.id}
          </p>
          <p className="sm:col-span-2">
            <span className="font-medium text-default-700">Source ID:</span>{" "}
            {event.sourceId ?? "-"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminSkillRadarContent() {
  const {
    data: positions,
    isLoading,
    isError,
    error,
    refetch: refetchPositions,
  } = useAdminSkillRadarPositions();
  const [eventFilters, setEventFilters] = useState<AdminSkillScoreEventFilters>({
    page: 1,
    limit: 10,
  });
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const {
    data: eventsPage,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useAdminSkillRadarEvents(eventFilters);
  const {
    createPositionMutation,
    updatePositionMutation,
    deletePositionMutation,
    createSkillMutation,
    createSkillsMutation,
    updateSkillMutation,
  } = useAdminSkillRadarMutations();
  const suggestPositionSkillsMutation = useSuggestPositionSkills();
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<AdminSkillRadarPosition | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<AdminSkillRadarPosition | null>(null);
  const [positionForm, setPositionForm] = useState<PositionPayload>(emptyPositionForm);
  const [editingSkill, setEditingSkill] = useState<SkillRadarSkill | null>(null);
  const [skillForm, setSkillForm] = useState<PositionSkillPayload>(emptySkillForm);
  const [skillKeywordsText, setSkillKeywordsText] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [suggestions, setSuggestions] = useState<EditableSkillSuggestion[]>([]);
  const events = eventsPage.items;

  const selectedPosition = useMemo(
    () => positions.find((position) => position.id === selectedPositionId) ?? positions[0] ?? null,
    [positions, selectedPositionId],
  );

  const eventSkillOptions = useMemo(() => {
    const filteredPositions = eventFilters.positionId
      ? positions.filter((position) => position.id === eventFilters.positionId)
      : positions;

    return filteredPositions.flatMap((position) =>
      position.skills.map((skill) => ({
        ...skill,
        positionName: position.name,
      })),
    );
  }, [eventFilters.positionId, positions]);

  useEffect(() => {
    if (!selectedPositionId && positions.length > 0) {
      setSelectedPositionId(positions[0].id);
    }
  }, [positions, selectedPositionId]);

  useEffect(() => {
    setSuggestions([]);
  }, [selectedPositionId]);

  const updateEventFilters = (patch: Partial<AdminSkillScoreEventFilters>) => {
    setExpandedEventId(null);
    setEventFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
      ...(patch.positionId !== undefined ? { skillId: undefined } : {}),
    }));
  };

  const clearEventFilters = () => {
    setExpandedEventId(null);
    setEventFilters({ page: 1, limit: eventFilters.limit ?? 10 });
  };

  const exportCurrentEvents = () => {
    if (events.length === 0) return;

    const blob = new Blob([buildEventsCsv(events)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skill-radar-evidence-page-${eventsPage.page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const handleConfirmDeletePosition = () => {
    if (!deletingPosition) return;

    setMessage(null);
    deletePositionMutation.mutate(deletingPosition.id, {
      onSuccess: () => {
        if (selectedPositionId === deletingPosition.id) {
          setSelectedPositionId(null);
        }
        if (editingPosition?.id === deletingPosition.id) {
          resetPositionForm();
        }
        setMessage({ text: "ลบ Position สำเร็จ", isError: false });
        setDeletingPosition(null);
      },
      onError: (error: unknown) => {
        setMessage({ text: getErrorMessage(error, "ลบ Position ไม่สำเร็จ"), isError: true });
        setDeletingPosition(null);
      },
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
    if (!editingSkill && !selectedPosition.isActive) {
      setMessage({ text: "ไม่สามารถเพิ่ม Skill ใน Position ที่ปิดใช้งานได้", isError: true });
      return;
    }
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

  const handleSuggestSkills = () => {
    if (!selectedPosition) return;
    if (!selectedPosition.isActive) {
      setMessage({ text: "ไม่สามารถแนะนำ Skill สำหรับ Position ที่ปิดใช้งานได้", isError: true });
      return;
    }
    setMessage(null);
    suggestPositionSkillsMutation.mutate(selectedPosition.id, {
      onSuccess: (data) => {
        setSuggestions(
          data.map((suggestion) => ({
            name: suggestion.name,
            description: suggestion.description,
            keywordsText: keywordsToText(suggestion.keywords),
          })),
        );
        setMessage({
          text: `AI แนะนำ ${data.length} skill แล้ว กรุณาตรวจสอบก่อนกดบันทึก`,
          isError: false,
        });
      },
      onError: (error: unknown) => {
        setMessage({ text: getErrorMessage(error, "AI แนะนำ skill ไม่สำเร็จ"), isError: true });
      },
    });
  };

  const updateSuggestion = (index: number, patch: Partial<EditableSkillSuggestion>) => {
    setSuggestions((prev) =>
      prev.map((suggestion, i) => (i === index ? { ...suggestion, ...patch } : suggestion)),
    );
  };

  const removeSuggestion = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAllSuggestions = async () => {
    if (!selectedPosition || suggestions.length === 0) return;
    const payload = suggestions
      .map((suggestion) => ({
        name: suggestion.name.trim(),
        description: suggestion.description.trim(),
        keywords: textToKeywords(suggestion.keywordsText),
        weight: 1,
        isActive: true,
      }))
      .filter((suggestion) => suggestion.name);

    if (payload.length === 0) {
      setMessage({ text: "กรุณาระบุชื่อ Skill อย่างน้อยหนึ่งรายการ", isError: true });
      return;
    }

    setMessage(null);
    try {
      await createSkillsMutation.mutateAsync({ positionId: selectedPosition.id, payload });
      setSuggestions([]);
      setMessage({ text: "บันทึก Skill ที่แนะนำสำเร็จ", isError: false });
    } catch (error) {
      setMessage({ text: getErrorMessage(error, "บันทึก Skill ที่แนะนำไม่สำเร็จ"), isError: true });
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
        <BaseCard className="space-y-3">
          <p className="text-sm text-danger-600">
            {getErrorMessage(error, "โหลดข้อมูล Skill Radar ไม่สำเร็จ")}
          </p>
          <BaseButton size="sm" variant="flat" onPress={() => void refetchPositions()}>
            ลองอีกครั้ง
          </BaseButton>
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
                  <div
                    key={position.id}
                    className={`flex items-center gap-1 rounded-lg p-1 transition-colors ${
                      selectedPosition?.id === position.id
                        ? "bg-primary/15 text-primary"
                        : "bg-default-50 hover:bg-default-100 dark:bg-default-100/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPositionId(position.id)}
                      className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{position.name}</span>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${
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
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <BaseButton
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label={`แก้ไข ${position.name}`}
                        title="แก้ไข Position"
                        onPress={() => startEditPosition(position)}
                      >
                        <Pencil size={14} />
                      </BaseButton>
                      <BaseButton
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        aria-label={`ลบ ${position.name}`}
                        title="ลบ Position"
                        onPress={() => setDeletingPosition(position)}
                      >
                        <Trash2 size={14} />
                      </BaseButton>
                    </div>
                  </div>
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
                  <div className="flex gap-2">
                    <BaseButton
                      size="sm"
                      variant="flat"
                      startContent={<Sparkles size={14} />}
                      isLoading={suggestPositionSkillsMutation.isPending}
                      isDisabled={!selectedPosition.isActive}
                      onPress={handleSuggestSkills}
                    >
                      AI Suggest Skills
                    </BaseButton>
                    <BaseButton
                      size="sm"
                      variant="flat"
                      isDisabled={!selectedPosition.isActive}
                      onPress={resetSkillForm}
                    >
                      เพิ่ม Skill
                    </BaseButton>
                  </div>
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

            {selectedPosition && suggestions.length > 0 && (
              <BaseCard className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium">
                    Skill ที่ AI แนะนำ ({suggestions.length}) — ตรวจสอบก่อนบันทึก
                  </h2>
                  <BaseButton size="sm" variant="flat" onPress={() => setSuggestions([])}>
                    ยกเลิกทั้งหมด
                  </BaseButton>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-lg bg-default-50 p-3 dark:bg-default-100/10"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <BaseInput
                            label="ชื่อ Skill"
                            value={suggestion.name}
                            onValueChange={(name) => updateSuggestion(index, { name })}
                          />
                          <BaseInput
                            label="คำอธิบาย"
                            value={suggestion.description}
                            onValueChange={(description) => updateSuggestion(index, { description })}
                          />
                          <BaseInput
                            label="Keywords"
                            placeholder="api, database, auth"
                            value={suggestion.keywordsText}
                            onValueChange={(keywordsText) => updateSuggestion(index, { keywordsText })}
                          />
                        </div>
                        <BaseButton
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeSuggestion(index)}
                        >
                          <Trash2 size={14} />
                        </BaseButton>
                      </div>
                    </div>
                  ))}
                </div>
                <BaseButton
                  startContent={<Save size={16} />}
                  isLoading={createSkillsMutation.isPending}
                  onPress={handleSaveAllSuggestions}
                >
                  บันทึก Skill ทั้งหมดที่แนะนำ
                </BaseButton>
              </BaseCard>
            )}

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
                  isDisabled={!editingSkill && !selectedPosition.isActive}
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
            <h2 className="font-medium">Skill Evidence Audit</h2>
            <p className="text-sm text-default-500">
              ตรวจสอบคะแนน Skill Radar ตามผู้ใช้ ตำแหน่ง skill และแหล่งที่มาของคะแนน
            </p>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <BaseButton
            size="sm"
            variant="flat"
            startContent={<Download size={14} />}
            isDisabled={events.length === 0}
            onPress={exportCurrentEvents}
          >
            Export CSV
          </BaseButton>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <BaseInput
            label="Search"
            placeholder="ชื่อผู้ใช้, email, skill, reason"
            value={eventFilters.search ?? ""}
            onValueChange={(search) => updateEventFilters({ search: search || undefined })}
          />
          <BaseInput
            label="User ID"
            placeholder="กรองด้วย userId"
            value={eventFilters.userId ?? ""}
            onValueChange={(userId) => updateEventFilters({ userId: userId || undefined })}
          />
          <label className="flex flex-col gap-1 text-sm text-default-600">
            Position
            <select
              className="h-10 rounded-lg border border-default-200 bg-background px-3 text-sm outline-none"
              value={eventFilters.positionId ?? ""}
              onChange={(event) =>
                updateEventFilters({ positionId: event.target.value || undefined })
              }
            >
              <option value="">ทั้งหมด</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-default-600">
            Skill
            <select
              className="h-10 rounded-lg border border-default-200 bg-background px-3 text-sm outline-none"
              value={eventFilters.skillId ?? ""}
              onChange={(event) => updateEventFilters({ skillId: event.target.value || undefined })}
            >
              <option value="">ทั้งหมด</option>
              {eventSkillOptions.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} / {skill.positionName}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-default-600">
            Source
            <select
              className="h-10 rounded-lg border border-default-200 bg-background px-3 text-sm outline-none"
              value={eventFilters.sourceType ?? ""}
              onChange={(event) =>
                updateEventFilters({ sourceType: event.target.value || undefined })
              }
            >
              <option value="">ทั้งหมด</option>
              <option value="QUIZ_ATTEMPT">Quiz</option>
              <option value="AI_CHAT_QUESTION">AI Chat</option>
              <option value="LESSON_COMPLETION">Lesson</option>
              <option value="LESSON_TOPIC_CREATED">Lesson Topic</option>
              <option value="LESSON_CHAT_QUESTION">Lesson Chat</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-default-600">
            Per page
            <select
              className="h-10 rounded-lg border border-default-200 bg-background px-3 text-sm outline-none"
              value={eventFilters.limit ?? 10}
              onChange={(event) => updateEventFilters({ limit: Number(event.target.value) })}
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <div className="flex items-end">
            <BaseButton
              size="sm"
              variant="flat"
              startContent={<RotateCcw size={14} />}
              onPress={clearEventFilters}
            >
              Clear filters
            </BaseButton>
          </div>
        </div>

        {isEventsLoading ? (
          <p className="text-sm text-default-500">กำลังโหลด evidence...</p>
        ) : isEventsError ? (
          <div className="space-y-3">
            <p className="text-sm text-danger-600">
              {getErrorMessage(eventsError, "โหลด evidence ไม่สำเร็จ")}
            </p>
            <BaseButton size="sm" variant="flat" onPress={() => void refetchEvents()}>
              ลองอีกครั้ง
            </BaseButton>
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-default-500">
            ยังไม่มี evidence สำหรับ Skill Radar ลองทำ quiz หรือถาม AI Chat ก่อนครับ
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <SkillEvidenceItem
                key={event.id}
                event={event}
                isExpanded={expandedEventId === event.id}
                onToggle={() =>
                  setExpandedEventId((current) => (current === event.id ? null : event.id))
                }
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2 border-t border-default-100 pt-4 text-sm text-default-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            หน้า {eventsPage.page} จาก {eventsPage.totalPages} · ทั้งหมด {eventsPage.total} รายการ
          </span>
          <div className="flex items-center gap-2">
            <BaseButton
              size="sm"
              variant="flat"
              startContent={<ChevronLeft size={14} />}
              isDisabled={eventsPage.page <= 1 || isEventsLoading}
              onPress={() => updateEventFilters({ page: eventsPage.page - 1 })}
            >
              ก่อนหน้า
            </BaseButton>
            <BaseButton
              size="sm"
              variant="flat"
              endContent={<ChevronRight size={14} />}
              isDisabled={eventsPage.page >= eventsPage.totalPages || isEventsLoading}
              onPress={() => updateEventFilters({ page: eventsPage.page + 1 })}
            >
              ถัดไป
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <Modal isOpen={!!deletingPosition} onClose={() => setDeletingPosition(null)}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบ Position</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              ลบได้เฉพาะ Position ที่ยังไม่มี Skill, ผู้ใช้, คะแนน หรือข้อมูลอื่นที่เกี่ยวข้องเท่านั้น
            </p>
            {deletingPosition && <p className="font-medium">{deletingPosition.name}</p>}
            <p className="text-sm text-default-500">
              หากมีข้อมูลอยู่ ระบบจะคง Position เดิมไว้และแนะนำให้ปิดใช้งานแทน
            </p>
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setDeletingPosition(null)}>
              ยกเลิก
            </BaseButton>
            <BaseButton
              color="danger"
              isLoading={deletePositionMutation.isPending}
              onPress={handleConfirmDeletePosition}
            >
              ลบ Position
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
