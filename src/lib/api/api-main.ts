import type { SendMessagePayload, SendMessageResult } from "@/types/app/chat";
import type { HistoryItem } from "@/types/app/history";
import type { IssueFormValues, IssueReport } from "@/types/app/issue";
import type {
  KnowledgeBaseFormValues,
  KnowledgeBaseItem,
  RecommendQuery,
  RecommendationResult,
  GenerateKnowledgeResult,
  ConfirmKnowledgePayload,
} from "@/types/app/knowledgeBase";
import type { DashboardStats } from "@/types/app/dashboard";
import { mainClient } from "./client";

export const sendChatMessageApi = (payload: SendMessagePayload) =>
  mainClient.post<SendMessageResult>("/chat", payload);

export const getSessionMessagesApi = (sessionId: string) =>
  mainClient.get<SendMessageResult["messages"]>("/chat", { params: { sessionId } });

export const getHistoryListApi = () => mainClient.get<HistoryItem[]>("/history");

export const createIssueApi = (payload: IssueFormValues) =>
  mainClient.post<IssueReport>("/issues", payload);

export const getIssueListApi = () => mainClient.get<IssueReport[]>("/issues");

export const learnFromIssueApi = (id: string) =>
  mainClient.post<{ action: "created" | "updated"; article: { id: string; title: string } }>(
    `/issues/${id}/learn`,
  );

export const getKnowledgeBaseListApi = () => mainClient.get<KnowledgeBaseItem[]>("/knowledge-base");

export const createKnowledgeBaseApi = (payload: KnowledgeBaseFormValues) =>
  mainClient.post<KnowledgeBaseItem>("/knowledge-base", payload);

export const updateKnowledgeBaseApi = (id: string, payload: KnowledgeBaseFormValues) =>
  mainClient.put<KnowledgeBaseItem>(`/knowledge-base/${id}`, payload);

export const deleteKnowledgeBaseApi = (id: string) =>
  mainClient.delete<{ success: boolean }>(`/knowledge-base/${id}`);

export const getDashboardStatsApi = () => mainClient.get<DashboardStats>("/dashboard");

export const getRecommendationsApi = (payload: RecommendQuery) =>
  mainClient.post<RecommendationResult[]>("/knowledge-base/recommend", payload);

export const generateKnowledgeApi = (text: string) =>
  mainClient.post<GenerateKnowledgeResult>("/knowledge-base/generate", { text });

export const confirmKnowledgeApi = (payload: ConfirmKnowledgePayload) =>
  mainClient.post<KnowledgeBaseItem>("/knowledge-base/confirm", payload);
