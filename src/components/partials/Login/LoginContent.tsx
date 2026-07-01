"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { BaseButton } from "@/components/ui/Button";
import { BaseInput } from "@/components/ui/Input";
import { BaseCard } from "@/components/ui/Card";
import { registerUser } from "@/services/auth.service";

type AuthMode = "login" | "register";

function extractErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return "ดำเนินการไม่สำเร็จ ลองใหม่อีกครั้ง";
}

export default function LoginContent() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await registerUser({ email, name, password });
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      const session = await getSession();
      const role = session?.user?.role?.toUpperCase();
      router.push(role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => (current === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <BaseCard className="w-full max-w-md p-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-semibold">
              {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </h1>
            <p className="text-sm text-default-500">Learning Curve</p>
          </div>
          {mode === "register" && (
            <BaseInput
              label="ชื่อผู้ใช้"
              value={name}
              onValueChange={setName}
              minLength={2}
              isRequired
            />
          )}
          <BaseInput
            label="อีเมล"
            type="email"
            value={email}
            onValueChange={setEmail}
            isRequired
          />
          <BaseInput
            label="รหัสผ่าน"
            type={showPassword ? "text" : "password"}
            value={password}
            onValueChange={setPassword}
            minLength={6}
            endContent={
              <button
                type="button"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="text-default-400 hover:text-default-600"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            isRequired
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <BaseButton type="submit" isLoading={loading} className="w-full">
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </BaseButton>
          <button
            type="button"
            className="text-center text-sm text-primary hover:underline"
            onClick={toggleMode}
          >
            {mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </button>
          <p className="text-center text-xs text-default-400">บัญชีแอดมินเดิมยังใช้งานได้ตามปกติ</p>
        </form>
      </BaseCard>
    </div>
  );
}
