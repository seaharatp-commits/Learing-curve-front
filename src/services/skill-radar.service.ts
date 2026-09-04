import {
  createPositionSkillApi,
  createPositionSkillsApi,
  createSkillRadarPositionApi,
  getAdminSkillRadarEventsApi,
  getAdminSkillRadarPositionsApi,
  getCareerAlignmentApi,
  getMySkillRadarApi,
  getPositionSkillSuggestionsApi,
  getQuestionSkillSuggestionsApi,
  getSkillRadarPositionsApi,
  setQuestionSkillMappingsApi,
  updateMySkillRadarPositionApi,
  updatePositionSkillApi,
  updateSkillRadarPositionApi,
} from "@/lib/api/api-main";
import type {
  AdminSkillScoreEventFilters,
  AdminSkillScoreEventPage,
  AdminSkillRadarPosition,
  CareerAlignment,
  PositionPayload,
  PositionSkillPayload,
  PositionSkillSuggestion,
  QuestionSkillMappingPayload,
  QuestionSkillSuggestion,
  SkillRadarPosition,
  SkillRadarSkill,
  UserSkillRadar,
} from "@/types/app/skillRadar";

export const getMySkillRadar = async (positionId?: string): Promise<UserSkillRadar> => {
  const res = await getMySkillRadarApi(positionId);
  return res.data;
};

export const getCareerAlignment = async (): Promise<CareerAlignment> => {
  const res = await getCareerAlignmentApi();
  return res.data;
};

export const getSkillRadarPositions = async (): Promise<SkillRadarPosition[]> => {
  const res = await getSkillRadarPositionsApi();
  return res.data;
};

export const updateMySkillRadarPosition = async (positionId: string): Promise<UserSkillRadar> => {
  const res = await updateMySkillRadarPositionApi(positionId);
  return res.data;
};

export const getAdminSkillRadarPositions = async (): Promise<AdminSkillRadarPosition[]> => {
  const res = await getAdminSkillRadarPositionsApi();
  return res.data;
};

export const getAdminSkillRadarEvents = async (
  filters: AdminSkillScoreEventFilters = {},
): Promise<AdminSkillScoreEventPage> => {
  const res = await getAdminSkillRadarEventsApi(filters);
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

export const createPositionSkills = async (
  positionId: string,
  payload: PositionSkillPayload[],
): Promise<SkillRadarSkill[]> => {
  const res = await createPositionSkillsApi(positionId, payload);
  return res.data;
};

export const updatePositionSkill = async (
  id: string,
  payload: PositionSkillPayload,
): Promise<SkillRadarSkill> => {
  const res = await updatePositionSkillApi(id, payload);
  return res.data;
};

export const setQuestionSkillMappings = async (
  questionId: string,
  mappings: QuestionSkillMappingPayload[],
) => {
  const res = await setQuestionSkillMappingsApi(questionId, mappings);
  return res.data;
};

export const getQuestionSkillSuggestions = async (
  questionId: string,
): Promise<QuestionSkillSuggestion[]> => {
  const res = await getQuestionSkillSuggestionsApi(questionId);
  return res.data;
};

export const getPositionSkillSuggestions = async (
  positionId: string,
): Promise<PositionSkillSuggestion[]> => {
  const res = await getPositionSkillSuggestionsApi(positionId);
  return res.data;
};
