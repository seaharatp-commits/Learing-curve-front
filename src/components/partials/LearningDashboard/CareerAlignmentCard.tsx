"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Sparkles } from "lucide-react";
import { getCareerAlignmentContent } from "./careerAlignmentContent";

export type CareerAlignmentCardProps = {
  positionName: string;
  strengths?: string[];
  description?: string;
  quotes?: string[];
};

const QUOTE_ROTATION_MS = 2500;
const EMPTY_STATE_ITEMS = ["ทำ Quiz ที่เกี่ยวข้องกับตำแหน่ง", "ถามคำถามผ่าน AI Chat", "เรียนและทำบทเรียนให้สำเร็จ"];

// Highlight/AI-insight card that sits above the Skill Radar. Card chrome (blue
// gradient + glow + badges/animation) stays as the theme accent regardless of
// state. Quote/subtitle always come from the position-based config (single
// source of truth in careerAlignmentContent.ts) so they change immediately
// when the learner's position changes and never leak content from a previous
// position. `strengths.length === 0` is the backend-guaranteed signal for "no
// evidence yet" (calculateCareerAlignment only returns strengths once at least
// one skill has real evidence) — when true this renders a plain empty state
// instead of anything that looks like a completed AI analysis.
export function CareerAlignmentCard({ positionName, strengths = [], description, quotes = [] }: CareerAlignmentCardProps) {
  const hasEvidence = strengths.length > 0;
  const content = useMemo(() => getCareerAlignmentContent(positionName), [positionName]);
  const displayQuotes = useMemo(() => {
    const uniqueQuotes = Array.from(
      new Set(quotes.map((quote) => quote.trim()).filter((quote) => quote.length > 0)),
    ).slice(0, 4);

    return uniqueQuotes.length > 0 ? uniqueQuotes : [content.quote];
  }, [content.quote, quotes]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(0);
    if (displayQuotes.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % displayQuotes.length);
    }, QUOTE_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [displayQuotes]);

  const subtitleText = hasEvidence ? content.subtitle : `เริ่มสร้างเส้นทางของคุณในสาย ${positionName}`;
  const descriptionText = hasEvidence
    ? description
    : "ขณะนี้ยังไม่มี Evidence เพียงพอสำหรับวิเคราะห์จุดเด่นและความสอดคล้องกับตำแหน่งนี้";

  return (
    <section className="career-alignment-card relative overflow-hidden rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-50 via-white to-blue-50/70 p-5 shadow-lg shadow-blue-200/60 dark:border-blue-400/40 dark:bg-slate-950 dark:from-blue-950/45 dark:via-slate-950 dark:to-slate-900 dark:shadow-blue-950/30">
      {/* soft glow accents */}
      <div className="career-alignment-glow pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl dark:bg-blue-400/15" />
      <div className="career-alignment-sparkle pointer-events-none absolute right-4 top-4 text-blue-400/70 dark:text-blue-300/60">
        <Sparkles size={18} />
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
        <div className="flex gap-4">
          <div className="career-alignment-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-inner dark:border dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-200">
            <Award size={30} />
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {/* Title: strongest text */}
              <h2 className="career-alignment-title text-xl font-semibold text-blue-900 dark:text-blue-100">
                Career Alignment
              </h2>

              <span className="career-alignment-badge rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-300/30 dark:bg-blue-400/10 dark:text-blue-200">
                AI Powered
              </span>
            </div>

            {/* Quote: position-based, emotional highlight */}
            <p className="career-alignment-quote relative mb-2 flex min-h-11 w-fit max-w-full items-center break-words rounded-xl bg-blue-100/70 px-3 py-2 text-sm font-semibold leading-6 text-blue-900 shadow-sm shadow-blue-200/60 ring-1 ring-blue-200/70 transition duration-700 [text-shadow:0_0_18px_rgba(59,130,246,0.22)] motion-safe:animate-pulse dark:bg-blue-400/10 dark:text-blue-100 dark:shadow-none dark:ring-blue-300/25 dark:[text-shadow:0_0_20px_rgba(147,197,253,0.22)]">
              “{displayQuotes[quoteIndex] ?? content.quote}”
            </p>

            {/* Subtitle: highlighted sub-message, position-based */}
            <p className="career-alignment-subtitle mb-3 flex min-h-7 w-fit max-w-full break-words rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-200 dark:shadow-none">
              {subtitleText}
            </p>

            {/* Description: existing AI-generated / cached behavior when evidence exists,
                plain empty-state copy otherwise. Never a mock summary. */}
            <p className="career-alignment-description max-w-3xl text-xs font-normal leading-6 text-slate-500 dark:text-slate-300/80">
              {descriptionText}
            </p>
            {!hasEvidence && (
              <p className="career-alignment-empty-support mt-1 max-w-3xl text-xs font-normal leading-6 text-slate-500 dark:text-slate-300/80">
                เริ่มทำ Quiz ถามคำถามผ่าน AI Chat หรือเรียนบทเรียน เพื่อให้ระบบรู้จักทักษะของคุณมากขึ้น
              </p>
            )}
          </div>
        </div>

        <div className="career-alignment-strengths rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md shadow-slate-200/70 dark:border-blue-300/15 dark:bg-slate-900/75 dark:shadow-black/20">
          {hasEvidence ? (
            <>
              <h3 className="career-alignment-strengths-title mb-3 text-sm font-semibold text-success-600 dark:text-success-500">
                จุดเด่น
              </h3>
              <ul className="space-y-2">
                {strengths.map((strength) => (
                  <li
                    key={strength}
                    className="career-alignment-strength-item flex items-center gap-2 text-sm text-default-700 dark:text-default-300"
                  >
                    <span className="career-alignment-check text-success-500">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h3 className="career-alignment-strengths-title mb-3 text-sm font-semibold text-default-600 dark:text-default-400">
                เริ่มสร้างโปรไฟล์ทักษะ
              </h3>
              <ul className="space-y-2">
                {EMPTY_STATE_ITEMS.map((item, index) => (
                  <li
                    key={item}
                    className="career-alignment-strength-item flex items-center gap-2 text-sm text-default-700 dark:text-default-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-default-200 text-[11px] font-semibold text-default-600 dark:bg-default-100/20 dark:text-default-300">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default CareerAlignmentCard;
