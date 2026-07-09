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
    <section className="career-alignment-card relative overflow-hidden rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-50 via-white to-blue-50/70 p-5 shadow-lg shadow-blue-200/60 dark:border-blue-400/40 dark:bg-slate-950 dark:from-blue-950/45 dark:via-slate-950 dark:to-slate-900 dark:shadow-blue-950/30">
      {/* soft glow accents */}
      <div className="career-alignment-glow pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl dark:bg-blue-400/15" />
      <div className="career-alignment-sparkle pointer-events-none absolute right-4 top-4 text-blue-400/70 dark:text-blue-300/60">
        <Sparkles size={18} />
      </div>

      <div className="grid gap-5 md:grid-cols-[1.6fr_1fr] md:items-center">
        <div className="flex gap-4">
          <div className="career-alignment-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-inner dark:border dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-200">
            <Award size={30} />
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {/* Title: strongest text */}
              <h2 className="career-alignment-title text-xl font-bold text-blue-900 dark:text-blue-100">Career Alignment</h2>

              <span className="career-alignment-badge rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-300/30 dark:bg-blue-400/10 dark:text-blue-200">
                AI Powered
              </span>
            </div>

            {/* Quote: emotional highlight */}
            <p className="career-alignment-quote relative mb-2 inline-block rounded-xl bg-blue-100/70 px-3 py-2 text-sm font-semibold leading-6 text-blue-900 shadow-sm shadow-blue-200/60 ring-1 ring-blue-200/70 transition duration-700 [text-shadow:0_0_18px_rgba(59,130,246,0.22)] motion-safe:animate-pulse dark:bg-blue-400/10 dark:text-blue-100 dark:shadow-none dark:ring-blue-300/25 dark:[text-shadow:0_0_20px_rgba(147,197,253,0.22)]">
              “{CAREER_ALIGNMENT_QUOTE}”
            </p>

            {/* Subtitle: highlighted sub-message */}
            <p className="career-alignment-subtitle mb-3 inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-200 dark:shadow-none">
              {CAREER_ALIGNMENT_SUBTITLE}
            </p>

            {/* Description: existing AI-generated / cached behavior */}
            <p className="career-alignment-description max-w-3xl text-xs font-normal leading-6 text-slate-500 dark:text-slate-300/80">{description}</p>
          </div>
        </div>

        <div className="career-alignment-strengths rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md shadow-slate-200/70 dark:border-blue-300/15 dark:bg-slate-900/75 dark:shadow-black/20">
          <h3 className="career-alignment-strengths-title mb-3 text-sm font-bold text-success-600 dark:text-success-500">จุดเด่น</h3>

          <ul className="space-y-2">
            {displayStrengths.map((strength) => (
              <li key={strength} className="career-alignment-strength-item flex items-center gap-2 text-sm text-default-700 dark:text-default-300">
                <span className="career-alignment-check text-success-500">✓</span>
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
