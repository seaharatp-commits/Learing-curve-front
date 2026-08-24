"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck, UserCircle } from "lucide-react";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";
import { changePassword } from "@/services/auth.service";
import { extractErrorMessage } from "@/utils/extractErrorMessage";

type PasswordField = "current" | "new" | "confirm";

export default function AccountContent() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visibleFields, setVisibleFields] = useState<Record<PasswordField, boolean>>({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleVisible = (field: PasswordField) => {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  };

  const passwordToggle = (field: PasswordField, label: string) => (
    <button
      type="button"
      aria-label={label}
      className="rounded-md p-1.5 text-default-400 transition-colors hover:bg-default-100 hover:text-default-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:hover:bg-default-100/10 dark:hover:text-default-200"
      onClick={() => toggleVisible(field)}
    >
      {visibleFields[field] ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword });
      setMessage(result.message || "เปลี่ยนรหัสผ่านสำเร็จ");
      resetForm();
    } catch (err) {
      setError(extractErrorMessage(err, "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const email = session?.user?.email ?? "ยังไม่มีอีเมล";
  const accountType = session?.user?.role === "ADMIN" ? "Admin" : "ผู้เรียน";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">Account settings</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ตั้งค่าบัญชี</h1>
        <p className="max-w-2xl text-sm text-default-500">จัดการข้อมูลบัญชีและความปลอดภัยของคุณ</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <BaseCard className="bg-primary-50/45 dark:bg-primary-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <UserCircle size={30} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">บัญชีของคุณ</h2>
              <p className="truncate text-sm text-default-500">{email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-background/65 p-3 dark:bg-default-50/5">
              <Mail size={18} className="shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-default-500">อีเมลบัญชี</p>
                <p className="truncate text-sm font-medium">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-background/65 p-3 dark:bg-default-50/5">
              <ShieldCheck size={18} className="shrink-0 text-success-600" />
              <div>
                <p className="text-xs text-default-500">ประเภทบัญชี</p>
                <p className="text-sm font-medium">{accountType}</p>
              </div>
            </div>
          </div>

          <p className="mt-5 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs leading-5 text-default-500 dark:bg-primary-500/5">
            การเปลี่ยนรหัสผ่านมีผลเฉพาะบัญชีของคุณ และไม่กระทบข้อมูลการเรียนหรือประวัติการใช้งาน
          </p>
        </BaseCard>

        <BaseCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">เปลี่ยนรหัสผ่าน</h2>
                <p className="text-sm text-default-500">
                  กรอกรหัสผ่านปัจจุบัน แล้วตั้งรหัสผ่านใหม่สำหรับบัญชีนี้
                </p>
              </div>
            </div>

            {message && (
              <p role="status" className="rounded-lg bg-success-50 px-3 py-2 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-300">
                {message}
              </p>
            )}
            {error && (
              <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-500/10 dark:text-danger-300">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <BaseInput
                label="รหัสผ่านปัจจุบัน"
                type={visibleFields.current ? "text" : "password"}
                value={currentPassword}
                autoComplete="current-password"
                onValueChange={(value) => {
                  setCurrentPassword(value);
                  setError("");
                }}
                endContent={passwordToggle("current", "แสดงหรือซ่อนรหัสผ่านปัจจุบัน")}
                isRequired
              />
              <BaseInput
                label="รหัสผ่านใหม่"
                description="อย่างน้อย 8 ตัวอักษร"
                type={visibleFields.new ? "text" : "password"}
                value={newPassword}
                autoComplete="new-password"
                onValueChange={(value) => {
                  setNewPassword(value);
                  setError("");
                }}
                minLength={8}
                endContent={passwordToggle("new", "แสดงหรือซ่อนรหัสผ่านใหม่")}
                isRequired
              />
              <BaseInput
                label="ยืนยันรหัสผ่านใหม่"
                type={visibleFields.confirm ? "text" : "password"}
                value={confirmPassword}
                autoComplete="new-password"
                onValueChange={(value) => {
                  setConfirmPassword(value);
                  setError("");
                }}
                minLength={8}
                endContent={passwordToggle("confirm", "แสดงหรือซ่อนยืนยันรหัสผ่านใหม่")}
                isRequired
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-default-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-default-100/10">
              <p className="text-xs leading-5 text-default-400">ใช้รหัสผ่านที่คาดเดาได้ยากและไม่ใช้ซ้ำกับบริการอื่น</p>
              <BaseButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                บันทึกรหัสผ่านใหม่
              </BaseButton>
            </div>
          </form>
        </BaseCard>
      </div>
    </div>
  );
}
