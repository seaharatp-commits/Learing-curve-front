import {
  createPositionSkillApi,
  createSkillRadarPositionApi,
  getAdminSkillRadarPositionsApi,
  getMySkillRadarApi,
  updatePositionSkillApi,
  updateSkillRadarPositionApi,
} from "@/lib/api/api-main";
import type {
  AdminSkillRadarPosition,
  PositionPayload,
  PositionSkillPayload,
  SkillRadarSkill,
  UserSkillRadar,
} from "@/types/app/skillRadar";

export const getMySkillRadar = async (positionId?: string): Promise<UserSkillRadar> => {
  const res = await getMySkillRadarApi(positionId);
  return res.data;
};

export const getAdminSkillRadarPositions = async (): Promise<AdminSkillRadarPosition[]> => {
  const res = await getAdminSkillRadarPositionsApi();
  return res.data;
};

export const createSkillRadarPosition = async (
  payload: PositionPayload,
): Promise<AdminSkillRadarPosition> => {
  const res = await createSkillRadarPositionApi(payload);
  return res.data;
};

export const updateSkillRadarPosition = async (
  id: string,
  payload: PositionPayload,
): Promise<AdminSkillRadarPosition> => {
  const res = await updateSkillRadarPositionApi(id, payload);
  return res.data;
};

export const createPositionSkill = async (
  positionId: string,
  payload: PositionSkillPayload,
): Promise<SkillRadarSkill> => {
  const res = await createPositionSkillApi(positionId, payload);
  return res.data;
};

export const updatePositionSkill = async (
  id: string,
  payload: PositionSkillPayload,
): Promise<SkillRadarSkill> => {
  const res = await updatePositionSkillApi(id, payload);
  return res.data;
};
