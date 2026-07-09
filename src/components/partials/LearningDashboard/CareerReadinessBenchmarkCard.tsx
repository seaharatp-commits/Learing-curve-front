"use client";

import { Award, Sparkles, Star } from "lucide-react";

export type CareerReadinessBenchmarkCardProps = {
  level?: string;
  strengths?: string[];
  description?: string;
};

const DEFAULT_STRENGTHS = ["System Analysis", "FrontEnd", "การตั้งคำถามเชิงวิเคราะห์"];
const DEFAULT_DESCRIPTION =
  "คุณมีความพร้อมในระดับดี เหมาะสมสำหรับการวิเคราะห์ระบบและการพัฒนา FrontEnd " +
  "รักษาความต่อเนื่องและพัฒนาทักษะอย่างสม่ำเสมอ จะช่วยให้คุณก้าวสู่ระดับถัดไปได้เร็วขึ้น";

// Highlight/AI-insight card that sits above the Skill Radar. Uses NextUI semantic
// tokens (primary/default/success) + dark: variants so it adapts to both themes
// while still standing out from the plain summary cards via a blue gradient + glow.
export function CareerReadinessBenchmarkCard({
  level = "Junior Strong",
  strengths = DEFAULT_STRENGTHS,
  description = DEFAULT_DESCRIPTION,
}: CareerReadinessBenchmarkCardProps) {
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
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-primary-700 dark:text-primary-300">
                Career Readiness Benchmark
              </h2>

              <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:border-primary-400/30 dark:bg-primary-500/15 dark:text-primary-300">
                AI Powered
              </span>
            </div>

            <p className="mb-2 flex items-center gap-2 text-base font-semibold text-primary-700 dark:text-primary-300">
              <Star size={16} className="fill-warning text-warning" />
              <span>ระดับปัจจุบัน: {level}</span>
            </p>

            <p className="max-w-3xl text-sm leading-6 text-default-600 dark:text-default-500">
              {description}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-default-200 bg-background/85 p-4 shadow-sm dark:border-default-100/15 dark:bg-default-50/10">
          <h3 className="mb-3 text-sm font-bold text-success-600 dark:text-success-500">จุดเด่น</h3>

          <ul className="space-y-2">
            {displayStrengths.map((strength) => (
              <li
                key={strength}
                className="flex items-center gap-2 text-sm text-default-700 dark:text-default-300"
              >
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

export default CareerReadinessBenchmarkCard;
