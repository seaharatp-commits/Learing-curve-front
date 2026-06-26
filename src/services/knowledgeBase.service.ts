import type {
  KnowledgeBaseFormValues,
  KnowledgeBaseItem,
  RecommendQuery,
  RecommendationResult,
} from "@/types/app/knowledgeBase";
import {
  getKnowledgeBaseListApi,
  createKnowledgeBaseApi,
  updateKnowledgeBaseApi,
  deleteKnowledgeBaseApi,
  getRecommendationsApi,
} from "@/lib/api/api-main";

export const getKnowledgeBaseList = async (): Promise<KnowledgeBaseItem[]> => {
  const res = await getKnowledgeBaseListApi();
  return res.data;
};

export const createKnowledgeBase = async (
  payload: KnowledgeBaseFormValues
): Promise<KnowledgeBaseItem> => {
  const res = await createKnowledgeBaseApi(payload);
  return res.data;
};

export const updateKnowledgeBase = async (
  id: string,
  payload: KnowledgeBaseFormValues
): Promise<KnowledgeBaseItem> => {
  const res = await updateKnowledgeBaseApi(id, payload);
  return res.data;
};

export const deleteKnowledgeBase = async (id: string): Promise<{ success: boolean }> => {
  const res = await deleteKnowledgeBaseApi(id);
  return res.data;
};

export const getRecommendations = async (query: RecommendQuery): Promise<RecommendationResult[]> => {
  const res = await getRecommendationsApi(query);
  return res.data;
};
