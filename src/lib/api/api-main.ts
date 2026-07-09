import type { SendMessagePayload, SendMessageResult, SuggestedQuestionsResult } from "@/types/app/chat";
import type { ChangePasswordPayload, ChangePasswordResult, RegisterPayload, RegisterResult } from "@/types/app/auth";
import type { HistoryItem } from "@/types/app/history";
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
  AdminSkillScoreEventFilters,
  AdminSkillScoreEventPage,
  AdminSkillRadarPosition,
  CareerReadinessBenchmark,
  PositionPayload,
  PositionSkillPayload,
  PositionSkillSuggestion,
  QuestionSkillMappingPayload,
  QuestionSkillSuggestion,
  SkillRadarPosition,
  SkillRadarSkill,
  UserSkillRadar,
} from "@/types/app/skillRadar";
import type {
  LearningDashboard,
  LessonCompletion,
  LessonDetail,
  QuizListItem,
  QuizForAttempt,
  SubmitAnswer,
  QuizAttemptResult,
  QuizAttemptHistoryItem,
  GeneratedTopicResult,
  GeneratedLessonQuizResult,
  GenerateLessonFromTopicPayload,
  LessonChatResult,
} from "@/types/app/learning";
import { mainClient } from "./client";

export const sendChatMessageApi = (payload: SendMessagePayload) =>
  mainClient.post<SendMessageResult>("/chat", payload);

export const registerApi = (payload: RegisterPayload) =>
  mainClient.post<RegisterResult>("/auth/register", payload);

export const changePasswordApi = (payload: ChangePasswordPayload) =>
  mainClient.post<ChangePasswordResult>("/auth/change-password", payload);

export const getSessionMessagesApi = (sessionId: string) =>
  mainClient.get<SendMessageResult["messages"]>("/chat", { params: { sessionId } });

export const getSuggestedQuestionsApi = () =>
  mainClient.get<SuggestedQuestionsResult>("/chat/suggested-questions");

export const getHistoryListApi = () => mainClient.get<HistoryItem[]>("/history");

export const deleteHistoryApi = (sessionId: string) =>
  mainClient.delete<{ success: boolean }>(`/history/${sessionId}`);

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

export const getMySkillRadarApi = (positionId?: string) =>
  mainClient.get<UserSkillRadar>("/skill-radar/me", {
    params: positionId ? { positionId } : undefined,
  });

export const getCareerReadinessBenchmarkApi = () =>
  mainClient.get<CareerReadinessBenchmark>("/skill-radar/me/career-benchmark");

export const getSkillRadarPositionsApi = () =>
  mainClient.get<SkillRadarPosition[]>("/skill-radar/positions");

export const updateMySkillRadarPositionApi = (positionId: string) =>
  mainClient.put<UserSkillRadar>("/skill-radar/me/position", { positionId });

export const getAdminSkillRadarPositionsApi = () =>
  mainClient.get<AdminSkillRadarPosition[]>("/skill-radar/admin/positions");

export const getAdminSkillRadarEventsApi = (filters: AdminSkillScoreEventFilters = {}) =>
  mainClient.get<AdminSkillScoreEventPage>("/skill-radar/admin/events", {
    params: filters,
  });

export const createSkillRadarPositionApi = (payload: PositionPayload) =>
  mainClient.post<AdminSkillRadarPosition>("/skill-radar/admin/positions", payload);

export const updateSkillRadarPositionApi = (id: string, payload: PositionPayload) =>
  mainClient.patch<AdminSkillRadarPosition>(`/skill-radar/admin/positions/${id}`, payload);

export const createPositionSkillApi = (positionId: string, payload: PositionSkillPayload) =>
  mainClient.post<SkillRadarSkill>(`/skill-radar/admin/positions/${positionId}/skills`, payload);

export const updatePositionSkillApi = (id: string, payload: PositionSkillPayload) =>
  mainClient.patch<SkillRadarSkill>(`/skill-radar/admin/skills/${id}`, payload);

export const setQuestionSkillMappingsApi = (
  questionId: string,
  mappings: QuestionSkillMappingPayload[],
) =>
  mainClient.put(`/skill-radar/questions/${questionId}/skills`, {
    mappings,
  });

export const getQuestionSkillSuggestionsApi = (questionId: string) =>
  mainClient.get<QuestionSkillSuggestion[]>(
    `/skill-radar/questions/${questionId}/skill-suggestions`,
  );

export const getPositionSkillSuggestionsApi = (positionId: string) =>
  mainClient.get<PositionSkillSuggestion[]>(
    `/skill-radar/admin/positions/${positionId}/suggest-skills`,
  );

export const getLessonApi = (lessonId: string) =>
  mainClient.get<LessonDetail>(`/learning/lessons/${lessonId}`);

export const markLessonCompletedApi = (lessonId: string) =>
  mainClient.post<LessonCompletion>(`/learning/lessons/${lessonId}/complete`);

export const getQuizListApi = () => mainClient.get<QuizListItem[]>("/learning/quizzes");

export const getQuizForAttemptApi = (quizId: string) =>
  mainClient.get<QuizForAttempt>(`/learning/quizzes/${quizId}`);

export const getQuizAttemptsApi = (quizId: string) =>
  mainClient.get<QuizAttemptHistoryItem[]>(`/learning/quizzes/${quizId}/attempts`);

export const deleteQuizApi = (quizId: string) =>
  mainClient.delete<{ success: boolean }>(`/learning/quizzes/${quizId}`);

export const deleteLessonApi = (lessonId: string) =>
  mainClient.delete<{ success: boolean }>(`/learning/lessons/${lessonId}`);

export const submitQuizAttemptApi = (quizId: string, answers: SubmitAnswer[]) =>
  mainClient.post<QuizAttemptResult>(`/learning/quizzes/${quizId}/attempts`, { answers });

export const generateQuizFromArticleApi = (articleId: string) =>
  mainClient.post<{ id: string }>("/learning/quizzes/generate-from-article", { articleId });

export const generateLessonFromTopicApi = (payload: GenerateLessonFromTopicPayload) =>
  mainClient.post<GeneratedTopicResult>("/learning/lessons/generate-from-topic", payload);

export const askLessonQuestionApi = (lessonId: string, message: string, chatHistory: string) =>
  mainClient.post<LessonChatResult>(`/learning/lessons/${lessonId}/chat`, {
    message,
    chatHistory,
  });

export const generateQuizFromLessonApi = (lessonId: string, additionalPrompt: string) =>
  mainClient.post<GeneratedLessonQuizResult>(`/learning/lessons/${lessonId}/quizzes/generate`, {
    additionalPrompt,
  });
