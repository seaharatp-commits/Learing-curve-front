import type { ChangePasswordPayload, ChangePasswordResult, RegisterPayload, RegisterResult } from "@/types/app/auth";
import { changePasswordApi, registerApi } from "@/lib/api/api-main";

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResult> => {
  const res = await registerApi(payload);
  return res.data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<ChangePasswordResult> => {
  const res = await changePasswordApi(payload);
  return res.data;
};
