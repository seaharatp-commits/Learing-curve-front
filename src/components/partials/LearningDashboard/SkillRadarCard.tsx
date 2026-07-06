"use client";

import { Radar } from "lucide-react";
import { BaseCard } from "@/components/ui/Card";
import type { UserSkillRadar } from "@/types/app/skillRadar";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

interface SkillRadarCardProps {
  data?: UserSkillRadar;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const CHART_SIZE = 240;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 88;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

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
  if (score >= 75) return "bg-success";
  if (score >= 45) return "bg-warning";
  return "bg-primary";
}

export default function SkillRadarCard({ data, isLoading, isError, error }: SkillRadarCardProps) {
  const skills = data?.skills ?? [];
  const hasScores = skills.some((skill) => skill.score > 0);
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

  return (
    <BaseCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radar size={20} className="text-primary-500" />
            <h2 className="font-medium">Skill Radar</h2>
          </div>
          <p className="mt-1 text-sm text-default-500">
            {data?.position.name ?? "Software Engineer"} skill profile ของคุณ
          </p>
        </div>
        {data && (
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {data.position.name}
          </span>
        )}
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
        <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="mx-auto w-full max-w-[280px]">
            {skills.length >= 3 ? (
              <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className="h-auto w-full">
                {GRID_LEVELS.map((level) => (
                  <polygon
                    key={level}
                    points={polygonPoints(skills.length, MAX_RADIUS * level)}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.14"
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
                      strokeOpacity="0.12"
                      className="text-default-500"
                    />
                  );
                })}
                {valuePoints && (
                  <polygon
                    points={valuePoints}
                    fill="currentColor"
                    fillOpacity="0.18"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  />
                )}
                {skills.map((skill, index) => {
                  const point = polarPoint(index, skills.length, MAX_RADIUS + 22);
                  return (
                    <text
                      key={skill.id}
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-current text-[9px] font-medium text-default-600"
                    >
                      {skill.name.length > 12 ? `${skill.name.slice(0, 11)}...` : skill.name}
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

          <div className="space-y-3">
            {!hasScores && (
              <div className="rounded-lg bg-default-50 px-3 py-2 text-sm text-default-500 dark:bg-default-100/10">
                คะแนนยังเริ่มต้นที่ 0 หลังจาก Phase scoring เปิดใช้งาน คะแนนจะสะสมจาก quiz และกิจกรรมการเรียน
              </div>
            )}
            {skills.map((skill) => (
              <div key={skill.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-default-500">{skill.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-default-100 dark:bg-default-100/10">
                  <div
                    className={`h-2 rounded-full ${scoreColor(skill.score)}`}
                    style={{ width: `${Math.max(0, Math.min(100, skill.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </BaseCard>
  );
}
