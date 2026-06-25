"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/ui/Button";
import { BaseInput } from "@/components/ui/Input";
import { BaseCard } from "@/components/ui/Card";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <BaseCard className="w-full max-w-md p-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
            <p className="text-sm text-default-500">Learning Curve</p>
          </div>
          <BaseInput
            label="อีเมล"
            type="email"
            value={email}
            onValueChange={setEmail}
            isRequired
          />
          <BaseInput
            label="รหัสผ่าน"
            type="password"
            value={password}
            onValueChange={setPassword}
            isRequired
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <BaseButton type="submit" isLoading={loading} className="w-full">
            เข้าสู่ระบบ
          </BaseButton>
          <p className="text-center text-xs text-default-400">
            ทดสอบ: admin@learningcurve.dev / admin1234 หรือ user@learningcurve.dev / user1234
          </p>
        </form>
      </BaseCard>
    </div>
  );
}
