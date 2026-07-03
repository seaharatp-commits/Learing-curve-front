"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
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
      className="text-default-400 hover:text-default-600"
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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-sm text-default-500">Account</p>
        <h1 className="text-2xl font-semibold">ตั้งค่าบัญชี</h1>
        <p className="text-sm text-default-500">{session?.user?.email}</p>
      </div>

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
            <p className="rounded-lg bg-success-50 px-3 py-2 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-300">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-500/10 dark:text-danger-300">
              {error}
            </p>
          )}

          <BaseInput
            label="รหัสผ่านปัจจุบัน"
            type={visibleFields.current ? "text" : "password"}
            value={currentPassword}
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
            onValueChange={(value) => {
              setConfirmPassword(value);
              setError("");
            }}
            minLength={8}
            endContent={passwordToggle("confirm", "แสดงหรือซ่อนยืนยันรหัสผ่านใหม่")}
            isRequired
          />

          <div className="flex justify-end">
            <BaseButton type="submit" isLoading={isSubmitting}>
              บันทึกรหัสผ่านใหม่
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
  );
}
