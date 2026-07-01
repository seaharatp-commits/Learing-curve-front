"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BookOpen, LogOut, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ADMIN_NAV_ITEMS } from "./AdminLayout.config";

const ICONS = { LayoutDashboard, BookOpen };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 px-4 py-5">
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
            onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
