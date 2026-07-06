import { getMySkillRadarApi } from "@/lib/api/api-main";
import type { UserSkillRadar } from "@/types/app/skillRadar";

export const getMySkillRadar = async (positionId?: string): Promise<UserSkillRadar> => {
  const res = await getMySkillRadarApi(positionId);
  return res.data;
};
