"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, MessageSquareText, Radar, Sparkles, Target, TrendingUp } from "lucide-react";
import { BaseCard } from "@/components/ui/Card";
import type { SkillRadarPosition, SkillRadarSkillScore, UserSkillRadar } from "@/types/app/skillRadar";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

interface SkillRadarCardProps {
  data?: UserSkillRadar;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  positions: SkillRadarPosition[];
  isPositionsLoading: boolean;
  isSavingPosition: boolean;
  positionMessage?: { text: string; isError: boolean } | null;
  onChangePosition: (positionId: string) => void;
}

const CHART_SIZE = 320;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 112;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const SKILL_LABEL_ALIASES: Record<string, string> = {
  "System Analysis": "Analysis",
  "Financial Analysis": "Finance",
  "Risk Management": "Risk",
  "Market Research": "Market",
  "Portfolio Strategy": "Portfolio",
  "Decision Making": "Decision",
  "User Research": "Research",
  "Usability Testing": "Usability",
  "Design Systems": "Systems",
  "Financial Reporting": "Reporting",
  "Resource Management": "Resource",
  "Stakeholder Management": "Stakeholder",
  "Performance Analysis": "Performance",
  "Operating Systems": "OS",
  "Customer Support": "Support",
};

function polarPoint(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function polygonPoints(total: number, radius: number) {
  return Array.from({ length: total }, (_, index) => {
    const point = polarPoint(index, total, radius);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function scoreColor(score: number) {
  if (score <= 0) return "bg-default-300 dark:bg-default-600";
  if (score >= 75) return "bg-success";
  if (score >= 45) return "bg-warning";
  return "bg-primary";
}

function scoreTextColor(score: number, isTopSkill: boolean) {
  if (isTopSkill) return "text-warning-600";
  if (score <= 0) return "text-default-400";
  if (score >= 75) return "text-success-600";
  if (score >= 45) return "text-warning-600";
  return "text-primary";
}

function shortSkillLabel(name: string) {
  return SKILL_LABEL_ALIASES[name] ?? name;
}

function getRecommendations(skills: SkillRadarSkillScore[]) {
  const skillsWithEvidence = skills.filter((skill) => skill.evidenceCount > 0);
  const strengths = [...skillsWithEvidence]
    .sort((a, b) => b.score - a.score || b.evidenceCount - a.evidenceCount)
    .slice(0, 2);

  return { strengths };
}

export default function SkillRadarCard({
  data,
  isLoading,
  isError,
  error,
  positions,
  isPositionsLoading,
  isSavingPosition,
  positionMessage,
  onChangePosition,
}: SkillRadarCardProps) {
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const skills = data?.skills ?? [];
  const hasScores = skills.some((skill) => skill.score > 0);
  const { strengths } = getRecommendations(skills);
  // No fallback to an arbitrary 0%/no-evidence skill here — if nothing has
  // evidence yet, there is no real "top skill" to show (see empty-state below).
  const strongestSkill = strengths[0];
  const highlightedSkillId = hoveredSkillId ?? strongestSkill?.id ?? null;
  const highlightedSkill = skills.find((skill) => skill.id === highlightedSkillId) ?? strongestSkill;
  const strongestSkillId = strongestSkill?.id ?? null;
  const lowEvidenceCount = skills.filter((skill) => skill.evidenceCount === 0 || skill.score <= 0).length;
  const valuePoints =
    skills.length >= 3
      ? skills
          .map((skill, index) => {
            const radius = (Math.max(0, Math.min(100, skill.score)) / 100) * MAX_RADIUS;
            const point = polarPoint(index, skills.length, radius);
            return `${point.x},${point.y}`;
          })
          .join(" ")
      : "";
  const insightText = highlightedSkill
    ? `ตอนนี้ ${highlightedSkill.name} เด่นที่สุดที่ ${highlightedSkill.score}% จาก ${highlightedSkill.evidenceCount} evidence`
    : "ทำ quiz หรือถาม AI Chat เพื่อเริ่มสะสม evidence ให้ Skill Radar";
  const evidenceHint =
    lowEvidenceCount > 0
      ? `บาง skill ยังมี evidence น้อย กราฟบางด้านจึงยังแคบ`
      : "ข้อมูลเริ่มกระจายครบทุก skill แล้ว กราฟจะสะท้อน profile ได้แม่นขึ้นเรื่อย ๆ";

  return (
    <BaseCard className="border-primary/15 bg-primary-50/35 dark:bg-primary-500/10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radar size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold">Skill Radar</h2>
          </div>
          <p className="mt-1 text-sm text-default-500">
            {data?.position.name ?? "Software Engineer"} skill profile ของคุณ
          </p>
        </div>
        <div className="min-w-[220px]">
          <label className="mb-1 block text-xs font-medium text-default-500">Position</label>
          <select
            value={data?.position.id ?? ""}
            disabled={isLoading || isPositionsLoading || isSavingPosition || positions.length === 0}
            onChange={(event) => onChangePosition(event.target.value)}
            className="h-9 w-full rounded-lg border border-default-200 bg-background px-2 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-default-100/20 dark:bg-default-50/10"
          >
            {data && !positions.some((position) => position.id === data.position.id) && (
              <option value={data.position.id}>{data.position.name}</option>
            )}
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] leading-4 text-default-400">
            เลือกสายงานเพื่อเปลี่ยนชุด skill ที่ใช้แสดง profile
          </p>
          {positionMessage && (
            <p
              className={`mt-1 text-xs ${
                positionMessage.isError ? "text-danger-600" : "text-success-600"
              }`}
            >
              {positionMessage.text}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-default-400">กำลังโหลด Skill Radar...</p>
      ) : isError ? (
        <p className="text-sm text-danger-600">
          {getErrorMessage(error, "โหลด Skill Radar ไม่สำเร็จ")}
        </p>
      ) : skills.length === 0 ? (
        <p className="text-sm text-default-400">ยังไม่มี skill สำหรับตำแหน่งนี้</p>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,460px)_1fr] xl:items-center">
          <div className="mx-auto w-full max-w-[460px] rounded-3xl bg-background/70 p-5 shadow-lg shadow-primary/5 ring-1 ring-default-200/70 dark:bg-default-50/5 dark:ring-default-100/15">
            <div className="mb-3 space-y-2 rounded-2xl bg-default-50/80 px-4 py-3 text-sm dark:bg-default-100/10">
              {strongestSkill ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning-600">
                      Top Skill
                    </span>
                    <p className="font-medium text-foreground">{insightText}</p>
                  </div>
                  <p className="text-xs leading-5 text-default-500">{evidenceHint}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">ยังไม่พบ Top Skill</p>
                  <p className="text-xs leading-5 text-default-500">
                    เริ่มเก็บ Evidence เพื่อให้ระบบค้นพบทักษะที่โดดเด่นของคุณ
                  </p>
                </>
              )}
            </div>
            {skills.length >= 3 ? (
              <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className="h-auto w-full overflow-visible">
                {GRID_LEVELS.map((level) => (
                  <polygon
                    key={level}
                    points={polygonPoints(skills.length, MAX_RADIUS * level)}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={level === 1 ? "0.28" : "0.16"}
                    strokeWidth={level === 1 ? "1.1" : "0.8"}
                    className="text-default-500"
                  />
                ))}
                {skills.map((_, index) => {
                  const end = polarPoint(index, skills.length, MAX_RADIUS);
                  return (
                    <line
                      key={index}
                      x1={CENTER}
                      y1={CENTER}
                      x2={end.x}
                      y2={end.y}
                      stroke="currentColor"
                      strokeOpacity="0.16"
                      strokeWidth="0.8"
                      className="text-default-500"
                    />
                  );
                })}
                {valuePoints && (
                  <polygon
                    points={valuePoints}
                    fill="currentColor"
                    fillOpacity="0.22"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="text-primary drop-shadow-sm transition-all duration-500 ease-out"
                  />
                )}
                {skills.map((skill, index) => {
                  const radius = (Math.max(0, Math.min(100, skill.score)) / 100) * MAX_RADIUS;
                  const point = polarPoint(index, skills.length, radius);
                  const isHighlighted = skill.id === highlightedSkillId;
                  const isTopSkill = skill.id === strongestSkillId;

                  return (
                    <g
                      key={`dot-${skill.id}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredSkillId(skill.id)}
                      onMouseLeave={() => setHoveredSkillId(null)}
                    >
                      <title>{`${skill.name}: ${skill.score}% · ${skill.evidenceCount} evidence`}</title>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isTopSkill ? (isHighlighted ? 6 : 5) : isHighlighted ? 5.2 : 4}
                        className={`transition-all duration-200 ${
                          isTopSkill
                            ? "fill-warning stroke-background"
                            : isHighlighted
                              ? "fill-primary stroke-background"
                              : "fill-primary/80 stroke-background"
                        }`}
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
                {skills.map((skill, index) => {
                  const point = polarPoint(index, skills.length, MAX_RADIUS + 36);
                  const label = shortSkillLabel(skill.name);
                  const isHighlighted = skill.id === highlightedSkillId;
                  const isTopSkill = skill.id === strongestSkillId;
                  return (
                    <text
                      key={skill.id}
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`fill-current text-[10px] font-semibold transition-colors sm:text-[11px] ${
                        isTopSkill ? "text-warning-600" : isHighlighted ? "text-primary" : "text-default-600"
                      }`}
                    >
                      <title>{`${skill.name}: ${skill.score}% · ${skill.evidenceCount} evidence`}</title>
                      {label}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div className="rounded-lg border border-dashed border-default-200 p-4 text-center text-sm text-default-500">
                ต้องมีอย่างน้อย 3 skills เพื่อแสดง radar
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {!hasScores && (
              <div className="rounded-xl bg-default-50 px-3 py-2 text-sm text-default-500 dark:bg-default-100/10 sm:col-span-2 xl:col-span-1">
                คะแนนยังเริ่มต้นที่ 0 คะแนนจะค่อย ๆ สะสมจาก quiz, คำถาม AI Chat และการเรียนจบบทเรียน
              </div>
            )}
            {skills.map((skill) => (
              (() => {
                const isTopSkill = skill.id === strongestSkillId;
                return (
              <button
                key={skill.id}
                type="button"
                onMouseEnter={() => setHoveredSkillId(skill.id)}
                onMouseLeave={() => setHoveredSkillId(null)}
                className={`min-h-[74px] rounded-xl border p-3 text-left transition-all ${
                  skill.id === highlightedSkillId
                    ? isTopSkill
                      ? "border-warning/45 bg-warning/10"
                      : "border-primary/35 bg-primary/10"
                    : skill.score <= 0 || skill.evidenceCount === 0
                      ? "border-default-200/45 bg-background/25 opacity-60 hover:border-default-300 hover:bg-default-50/60 hover:opacity-80 dark:border-default-100/10 dark:bg-default-50/5"
                      : "border-default-200/50 bg-background/30 opacity-80 hover:border-primary/20 hover:bg-primary/5 hover:opacity-100 dark:border-default-100/10 dark:bg-default-50/5"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <span className="truncate">{skill.name}</span>
                    {isTopSkill && (
                      <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning-600">
                        จุดเด่น
                      </span>
                    )}
                  </span>
                  <span className={scoreTextColor(skill.score, isTopSkill)}>{skill.score}%</span>
                </div>
                <div className="h-1 rounded-full bg-default-100 dark:bg-default-100/10">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${scoreColor(skill.score)}`}
                    style={{ width: `${Math.max(0, Math.min(100, skill.score))}%` }}
                  />
                </div>
                {(skill.evidenceCount === 0 || skill.score <= 0) && (
                  <p className="mt-1 text-[11px] text-default-400">ยังไม่มี evidence</p>
                )}
              </button>
                );
              })()
            ))}
          </div>

          {/*
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-3">
              <div className="rounded-xl border border-default-200 bg-default-50/70 p-4 dark:border-default-100/15 dark:bg-default-100/10">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-success-500" />
                  <h3 className="text-sm font-semibold">จุดแข็งตอนนี้</h3>
                </div>
                {strengths.length === 0 ? (
                  <p className="text-sm text-default-500">
                    ยังไม่มีหลักฐานพอ ลองทำ quiz หรือถาม AI Chat ในหัวข้อที่สนใจก่อน
                  </p>
                ) : (
                  <div className="space-y-2">
                    {strengths.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onMouseEnter={() => setHoveredSkillId(skill.id)}
                        onMouseLeave={() => setHoveredSkillId(null)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          skill.id === highlightedSkillId ? "bg-success/10" : "hover:bg-success/5"
                        }`}
                      >
                        <span className="font-medium">{skill.name}</span>
                        <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs text-success-600">
                          {skill.score}% · {skill.evidenceCount} evidence
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-default-200/70 bg-default-50/70 p-3 dark:border-default-100/15 dark:bg-default-100/10">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-primary-500" />
                <h3 className="text-sm font-semibold">แนะนำขั้นตอนถัดไป</h3>
              </div>
              <div className="grid gap-2.5 text-sm md:grid-cols-3">
                <Link
                  href="/chat"
                  className="flex min-h-[58px] items-center gap-2.5 rounded-lg bg-background/70 px-3 py-2.5 leading-5 transition-colors hover:bg-background dark:bg-default-50/5 dark:hover:bg-default-100/15"
                >
                  <MessageSquareText size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>ถาม AI เพื่อเพิ่ม evidence</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex min-h-[58px] items-center gap-2.5 rounded-lg bg-background/70 px-3 py-2.5 leading-5 transition-colors hover:bg-background dark:bg-default-50/5 dark:hover:bg-default-100/15"
                >
                  <BookOpen size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>สร้างบทเรียนใหม่</span>
                </Link>
                <Link
                  href="/quizzes"
                  className="flex min-h-[58px] items-center gap-2.5 rounded-lg bg-background/70 px-3 py-2.5 leading-5 transition-colors hover:bg-background dark:bg-default-50/5 dark:hover:bg-default-100/15"
                >
                  <Target size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>ทำ Quiz เพื่อปรับ Radar</span>
                </Link>
              </div>
            </div>
          </div>
          */}
        </div>
      )}
    </BaseCard>
  );
}
