import type { RegisterPayload, RegisterResult } from "@/types/app/auth";
import { registerApi } from "@/lib/api/api-main";

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResult> => {
  const res = await registerApi(payload);
  return res.data;
};
