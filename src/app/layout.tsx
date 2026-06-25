import type { Metadata } from "next";
import { AppProviders } from "@/context/HeroUIProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Curve | AI Support",
  description: "ระบบตอบรับปัญหาด้วย AI สำหรับ Learning Curve",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="dark">
      <body className="bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
