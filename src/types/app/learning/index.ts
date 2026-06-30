export interface LearningProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface QuizPerformance {
  totalCompleted: number;
  averageScore: number;
  latestScore: number | null;
}

export interface RecentQuiz {
  id: string;
  title: string;
  score: number;
  completedAt: string;
}

export interface ContinueLearning {
  lessonId: string;
  title: string;
}

export interface LearningLessonItem {
  lessonId: string;
  title: string;
  completed: boolean;
}

export interface LearningDashboard {
  learningProgress: LearningProgress;
  quizPerformance: QuizPerformance;
  recentQuizzes: RecentQuiz[];
  continueLearning: ContinueLearning | null;
  lessons: LearningLessonItem[];
}

export interface LessonQuizItem {
  id: string;
  title: string;
  questionCount: number;
}

export interface LessonDetail {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  completedAt: string | null;
  quizzes: LessonQuizItem[];
}

export interface LessonCompletion {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface GeneratedTopicResult {
  lessonId: string;
  quizId: string | null;
  title: string;
}

export interface GenerateLessonFromTopicPayload {
  topic: string;
}

export interface GeneratedLessonQuizResult {
  quizId: string;
  title: string;
}

export interface LessonChatResult {
  answer: string;
}

export interface QuizListItem {
  id: string;
  title: string;
  questionCount: number;
  sourceArticleTitle: string | null;
  createdByUserId: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
}

export interface QuizQuestionForAttempt {
  id: string;
  questionText: string;
  options: string[];
}

export interface QuizForAttempt {
  id: string;
  title: string;
  questions: QuizQuestionForAttempt[];
}

export interface SubmitAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface AnswerResult {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string | null;
}

export interface QuizAttemptResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  answers: AnswerResult[];
}
