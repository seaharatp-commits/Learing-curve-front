import type { Metadata } from "next";
import { AppProviders } from "@/context/HeroUIProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Curve",
  description: "Learning Curve — AI Helpdesk และแดชบอร์ดการเรียนรู้",
};

// Runs before paint so the page never flashes the wrong theme. Defaults to
// light (per design: "soft palette, not dark-only") when nothing is stored yet.
const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var theme = localStorage.getItem("theme") || "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
