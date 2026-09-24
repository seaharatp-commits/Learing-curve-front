"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Sparkles } from "lucide-react";
import { BaseButton } from "@/components/ui/Button";
import { BaseInput } from "@/components/ui/Input";
import { BaseCard } from "@/components/ui/Card";
import { registerUser } from "@/services/auth.service";
import { extractErrorMessage } from "@/utils/extractErrorMessage";

type AuthMode = "login" | "register";

export default function LoginContent() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
          return;
        }
        await registerUser({ email, name, password });
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : result.error,
        );
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
    setConfirmPassword("");
    setError("");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-background to-background px-4 py-8 dark:from-primary-950/30 dark:via-background dark:to-background sm:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-200/35 blur-3xl dark:bg-primary-500/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-secondary-200/25 blur-3xl dark:bg-secondary-500/10" />

      <BaseCard className="relative w-full max-w-md overflow-hidden border-primary/15 bg-content1/95 shadow-xl shadow-primary/10 dark:border-white/10 dark:bg-[#11161d]/90">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-400 to-secondary" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="mb-2 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25">
              {mode === "login" ? <BookOpen size={24} /> : <Sparkles size={24} />}
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Learning Curve
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "ยินดีต้อนรับกลับมา" : "เริ่มเส้นทางการเรียนรู้"}
            </h1>
            <p className="mt-1 text-sm text-default-500">
              {mode === "login"
                ? "เข้าสู่ระบบเพื่อเรียนต่อจากจุดเดิมของคุณ"
                : "สร้างบัญชีเพื่อเริ่มเรียนรู้ในแบบของคุณ"}
            </p>
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
            onValueChange={(value) => {
              setPassword(value);
              setError("");
            }}
            minLength={6}
            endContent={
              <button
                type="button"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                aria-pressed={showPassword}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-default-400 transition-colors hover:bg-default-100 hover:text-default-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:hover:bg-white/10 dark:hover:text-default-200"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            }
            isRequired
          />
          {mode === "register" && (
            <BaseInput
              label="ยืนยันรหัสผ่าน"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onValueChange={(value) => {
                setConfirmPassword(value);
                setError("");
              }}
              minLength={6}
              isInvalid={Boolean(confirmPassword && password !== confirmPassword)}
              errorMessage={confirmPassword && password !== confirmPassword ? "รหัสผ่านไม่ตรงกัน" : undefined}
              endContent={
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "ซ่อนยืนยันรหัสผ่าน" : "แสดงยืนยันรหัสผ่าน"}
                  aria-pressed={showConfirmPassword}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-default-400 transition-colors hover:bg-default-100 hover:text-default-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:hover:bg-white/10 dark:hover:text-default-200"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              }
              isRequired
            />
          )}
          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-400/20 dark:bg-danger-500/10 dark:text-danger-300"
            >
              {error}
            </p>
          )}
          <BaseButton type="submit" isLoading={loading} size="lg" className="mt-1 h-11 w-full rounded-xl">
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </BaseButton>
          <button
            type="button"
            className="text-center text-sm font-medium text-primary transition-colors hover:text-primary-600 hover:underline dark:hover:text-primary-300"
            onClick={toggleMode}
          >
            {mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </button>
          <p className="border-t border-default-200/70 pt-3 text-center text-xs leading-5 text-default-400 dark:border-white/10">
            บัญชีแอดมินเดิมยังใช้งานได้ตามปกติ
          </p>
        </form>
      </BaseCard>
    </main>
  );
}
