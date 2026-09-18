"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, MessageSquare, LogOut, ShieldCheck, ClipboardList, UserCircle } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/chat", label: "แชทกับ AI", icon: MessageSquare },
  { href: "/quizzes", label: "แบบทดสอบ", icon: ClipboardList },
  { href: "/account", label: "Account", icon: UserCircle },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-white/10 bg-background/85 px-3 backdrop-blur-md sm:gap-4 sm:px-6">
        <Link href="/dashboard" className="shrink-0 whitespace-nowrap text-sm font-semibold sm:text-lg">
          Learning Curve
        </Link>
        <nav
          aria-label="เมนูหลัก"
          className="flex min-w-0 flex-1 touch-pan-x items-center justify-start gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth sm:justify-end sm:gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                ref={active ? activeItemRef : undefined}
                href={item.href}
                className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm transition-colors sm:px-3 ${
                  active
                    ? "border border-primary/25 bg-primary/15 text-primary"
                    : "text-default-600 hover:bg-default-100/70 dark:text-default-300 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm text-default-600 hover:bg-default-100/70 dark:text-default-300 dark:hover:bg-white/5 sm:px-3"
            >
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
            className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm text-red-400 hover:bg-red-500/10 sm:px-3"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </nav>
      </header>
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
