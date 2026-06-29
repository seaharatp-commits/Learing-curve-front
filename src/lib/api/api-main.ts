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
import type {
  LearningDashboard,
  LessonCompletion,
  LessonDetail,
  QuizListItem,
  QuizForAttempt,
  SubmitAnswer,
  QuizAttemptResult,
  GeneratedTopicResult,
} from "@/types/app/learning";
import { mainClient } from "./client";

export const sendChatMessageApi = (payload: SendMessagePayload) =>
  mainClient.post<SendMessageResult>("/chat", payload);

export const getSessionMessagesApi = (sessionId: string) =>
  mainClient.get<SendMessageResult["messages"]>("/chat", { params: { sessionId } });

export const getHistoryListApi = () => mainClient.get<HistoryItem[]>("/history");

export const deleteHistoryApi = (sessionId: string) =>
  mainClient.delete<{ success: boolean }>(`/history/${sessionId}`);

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

export const getLearningDashboardApi = () =>
  mainClient.get<LearningDashboard>("/learning/dashboard");

export const getLessonApi = (lessonId: string) =>
  mainClient.get<LessonDetail>(`/learning/lessons/${lessonId}`);

export const markLessonCompletedApi = (lessonId: string) =>
  mainClient.post<LessonCompletion>(`/learning/lessons/${lessonId}/complete`);

export const getQuizListApi = () => mainClient.get<QuizListItem[]>("/learning/quizzes");

export const getQuizForAttemptApi = (quizId: string) =>
  mainClient.get<QuizForAttempt>(`/learning/quizzes/${quizId}`);

export const deleteQuizApi = (quizId: string) =>
  mainClient.delete<{ success: boolean }>(`/learning/quizzes/${quizId}`);

export const submitQuizAttemptApi = (quizId: string, answers: SubmitAnswer[]) =>
  mainClient.post<QuizAttemptResult>(`/learning/quizzes/${quizId}/attempts`, { answers });

export const generateQuizFromArticleApi = (articleId: string) =>
  mainClient.post<{ id: string }>("/learning/quizzes/generate-from-article", { articleId });

export const generateQuizFromTopicApi = (topic: string) =>
  mainClient.post<GeneratedTopicResult>("/learning/quizzes/generate-from-topic", { topic });
