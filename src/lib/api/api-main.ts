import type { SendMessagePayload, SendMessageResult } from "@/types/app/chat";
import type { HistoryItem } from "@/types/app/history";
import type { IssueFormValues, IssueReport } from "@/types/app/issue";
import type { KnowledgeBaseFormValues, KnowledgeBaseItem } from "@/types/app/knowledgeBase";
import type { DashboardStats } from "@/types/app/dashboard";
import { mainClient } from "./client";

export const sendChatMessageApi = (payload: SendMessagePayload) =>
  mainClient.post<SendMessageResult>("/api/chat", payload);

export const getHistoryListApi = () => mainClient.get<HistoryItem[]>("/api/history");

export const createIssueApi = (payload: IssueFormValues) =>
  mainClient.post<IssueReport>("/api/issues", payload);

export const getIssueListApi = () => mainClient.get<IssueReport[]>("/api/issues");

export const getKnowledgeBaseListApi = () =>
  mainClient.get<KnowledgeBaseItem[]>("/api/knowledge-base");

export const createKnowledgeBaseApi = (payload: KnowledgeBaseFormValues) =>
  mainClient.post<KnowledgeBaseItem>("/api/knowledge-base", payload);

export const updateKnowledgeBaseApi = (id: string, payload: KnowledgeBaseFormValues) =>
  mainClient.put<KnowledgeBaseItem>(`/api/knowledge-base/${id}`, payload);

export const deleteKnowledgeBaseApi = (id: string) =>
  mainClient.delete<{ success: boolean }>(`/api/knowledge-base/${id}`);

export const getDashboardStatsApi = () => mainClient.get<DashboardStats>("/api/dashboard");
