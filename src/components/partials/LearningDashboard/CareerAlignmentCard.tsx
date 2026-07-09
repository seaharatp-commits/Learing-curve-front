"use client";

import { Award, Sparkles } from "lucide-react";

export type CareerAlignmentCardProps = {
  level?: string;
  strengths?: string[];
  description?: string;
};

const CAREER_ALIGNMENT_QUOTE = "คุณไม่จำเป็นต้องเก่งตั้งแต่แรก แต่คุณต้องเริ่มเพื่อที่จะเก่ง";
const CAREER_ALIGNMENT_SUBTITLE = "คุณคือ Talent ที่กำลังก้าวขึ้น ในวงการ Technology";
const DEFAULT_STRENGTHS = ["System Analysis", "FrontEnd", "การตั้งคำถามเชิงวิเคราะห์"];
const DEFAULT_DESCRIPTION =
  "คุณมีความพร้อมในระดับดี เหมาะสมสำหรับการวิเคราะห์ระบบและการพัฒนา FrontEnd " +
  "รักษาความต่อเนื่องและพัฒนาทักษะอย่างสม่ำเสมอ จะช่วยให้คุณก้าวสู่ระดับถัดไปได้เร็วขึ้น";

// Highlight/AI-insight card that sits above the Skill Radar. Card chrome (blue
// gradient + glow + badges) stays as the theme accent; the intro text hierarchy
// uses neutral middle-tone tokens: title strongest -> quote softer -> subtitle
// lightest. `level` is intentionally not shown as a bare label to keep a positive,
// non-judgmental tone — the AI description weaves the level in naturally instead.
export function CareerAlignmentCard({
  strengths = DEFAULT_STRENGTHS,
  description = DEFAULT_DESCRIPTION,
}: CareerAlignmentCardProps) {
  const displayStrengths = strengths.length > 0 ? strengths : DEFAULT_STRENGTHS;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/60 bg-gradient-to-r from-primary-50 via-background to-primary-50/40 p-5 shadow-lg shadow-primary/15 dark:border-primary-400/40 dark:from-primary-500/15 dark:via-default-50/5 dark:to-primary-500/10">
      {/* soft glow accents */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute right-4 top-4 text-primary-300 dark:text-primary-400/50">
        <Sparkles size={18} />
      </div>

      <div className="grid gap-5 md:grid-cols-[1.6fr_1fr] md:items-center">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 shadow-inner dark:bg-primary-500/20 dark:text-primary-300">
            <Award size={30} />
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {/* Title: strongest text */}
              <h2 className="text-xl font-bold text-foreground">Career Alignment</h2>

              <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:border-primary-400/30 dark:bg-primary-500/15 dark:text-primary-300">
                AI Powered
              </span>
            </div>

            {/* Quote: softer than title, darker than subtitle */}
            <p className="text-sm font-medium leading-6 text-default-600 dark:text-default-300">
              “{CAREER_ALIGNMENT_QUOTE}”
            </p>

            {/* Subtitle: lightest text */}
            <p className="mb-2 text-xs text-default-500 dark:text-default-400">{CAREER_ALIGNMENT_SUBTITLE}</p>

            {/* Description: existing AI-generated / cached behavior */}
            <p className="max-w-3xl text-sm leading-6 text-default-600 dark:text-default-400">{description}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-default-200 bg-background/85 p-4 shadow-sm dark:border-default-100/15 dark:bg-default-50/10">
          <h3 className="mb-3 text-sm font-bold text-success-600 dark:text-success-500">จุดเด่น</h3>

          <ul className="space-y-2">
            {displayStrengths.map((strength) => (
              <li key={strength} className="flex items-center gap-2 text-sm text-default-700 dark:text-default-300">
                <span className="text-success-500">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default CareerAlignmentCard;
