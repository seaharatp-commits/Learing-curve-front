"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { NextAuthProvider } from "@/context/auth/NextAuthProvider";
import { QueryProvider } from "@/context/query/QueryProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <NextAuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </NextAuthProvider>
    </HeroUIProvider>
  );
}
