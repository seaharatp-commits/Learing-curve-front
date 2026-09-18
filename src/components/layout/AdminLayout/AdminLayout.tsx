"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrainCircuit, LayoutDashboard, BookOpen, LogOut, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ADMIN_NAV_ITEMS } from "./AdminLayout.config";

const ICONS = { LayoutDashboard, BookOpen, BrainCircuit };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeMobileItemRef = useRef<HTMLAnchorElement | null>(null);

  const handleSignOut = () => {
    void signOut({ redirect: false }).then(() => router.push("/login"));
  };

  useEffect(() => {
    activeMobileItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col md:flex-row">
      <header className="sticky top-0 z-40 border-b border-default-200/70 bg-background/90 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-3">
          <Link
            href="/admin/dashboard"
            className="flex min-w-0 items-center gap-2 text-sm font-semibold"
          >
            <ShieldCheck size={17} className="shrink-0 text-primary" />
            <span className="truncate">LC · Admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="ออกจากระบบ"
              title="ออกจากระบบ"
              className="flex size-9 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
        <nav
          aria-label="เมนูผู้ดูแลระบบ"
          className="flex touch-pan-x gap-1.5 overflow-x-auto overscroll-x-contain px-3 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                ref={active ? activeMobileItemRef : undefined}
                href={item.href}
                className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm transition-colors ${
                  active
                    ? "border border-primary/25 bg-primary/15 text-primary"
                    : "text-default-600 hover:bg-default-100/70"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-default-200/70 px-4 py-5 md:flex">
        <Link
          href="/admin/dashboard"
          className="mb-6 flex items-center gap-2 px-3 text-lg font-semibold"
        >
          <ShieldCheck size={18} className="text-primary" />
          LC · Admin
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-primary/20 text-primary" : "hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">{children}</main>
    </div>
  );
}
