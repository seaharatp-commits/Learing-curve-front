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
import {
  getLearningDashboardApi,
  getLessonApi,
  markLessonCompletedApi,
  getQuizListApi,
  getQuizForAttemptApi,
  getQuizAttemptsApi,
  deleteQuizApi,
  deleteLessonApi,
  submitQuizAttemptApi,
  generateQuizFromArticleApi,
  generateLessonFromTopicApi,
  askLessonQuestionApi,
  generateQuizFromLessonApi,
} from "@/lib/api/api-main";

export const getLearningDashboard = async (): Promise<LearningDashboard> => {
  const res = await getLearningDashboardApi();
  return res.data;
};

export const getLesson = async (lessonId: string): Promise<LessonDetail> => {
  const res = await getLessonApi(lessonId);
  return res.data;
};

export const markLessonCompleted = async (lessonId: string): Promise<LessonCompletion> => {
  const res = await markLessonCompletedApi(lessonId);
  return res.data;
};

export const getQuizList = async (): Promise<QuizListItem[]> => {
  const res = await getQuizListApi();
  return res.data;
};

export const getQuizForAttempt = async (quizId: string): Promise<QuizForAttempt> => {
  const res = await getQuizForAttemptApi(quizId);
  return res.data;
};

export const getQuizAttempts = async (quizId: string): Promise<QuizAttemptHistoryItem[]> => {
  const res = await getQuizAttemptsApi(quizId);
  return res.data;
};

export const deleteQuiz = async (quizId: string): Promise<{ success: boolean }> => {
  const res = await deleteQuizApi(quizId);
  return res.data;
};

export const deleteLesson = async (lessonId: string): Promise<{ success: boolean }> => {
  const res = await deleteLessonApi(lessonId);
  return res.data;
};

export const submitQuizAttempt = async (
  quizId: string,
  answers: SubmitAnswer[],
): Promise<QuizAttemptResult> => {
  const res = await submitQuizAttemptApi(quizId, answers);
  return res.data;
};

export const generateQuizFromArticle = async (articleId: string) => {
  const res = await generateQuizFromArticleApi(articleId);
  return res.data;
};

export const generateLessonFromTopic = async (
  payload: GenerateLessonFromTopicPayload,
): Promise<GeneratedTopicResult> => {
  const res = await generateLessonFromTopicApi(payload);
  return res.data;
};

export const askLessonQuestion = async (
  lessonId: string,
  message: string,
  chatHistory: string,
): Promise<LessonChatResult> => {
  const res = await askLessonQuestionApi(lessonId, message, chatHistory);
  return res.data;
};

export const generateQuizFromLesson = async (
  lessonId: string,
  additionalPrompt: string,
): Promise<GeneratedLessonQuizResult> => {
  const res = await generateQuizFromLessonApi(lessonId, additionalPrompt);
  return res.data;
};
