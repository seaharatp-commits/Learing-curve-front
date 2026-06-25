"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { MessageSquare, History, FileWarning, LogOut, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/chat", label: "แชทกับ AI", icon: MessageSquare },
  { href: "/history", label: "ประวัติ", icon: History },
  { href: "/report", label: "แจ้งปัญหา", icon: FileWarning },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link href="/chat" className="text-lg font-semibold">
          Learning Curve
        </Link>
        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
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
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
            >
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
