import type {
  LearningDashboard,
  QuizListItem,
  QuizForAttempt,
  SubmitAnswer,
  QuizAttemptResult,
} from "@/types/app/learning";
import {
  getLearningDashboardApi,
  getQuizListApi,
  getQuizForAttemptApi,
  submitQuizAttemptApi,
  generateQuizFromArticleApi,
} from "@/lib/api/api-main";

export const getLearningDashboard = async (): Promise<LearningDashboard> => {
  const res = await getLearningDashboardApi();
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
