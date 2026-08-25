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
  recommendedKnowledgeBases?: Array<{
    articleId: string;
    title: string;
    preview: string | null;
    summary?: string | null;
    confidenceScore: number;
    matchedSkills: string[];
    reason: string;
    whyThisKBIsRelevant: string;
    shouldRecommend: boolean;
  }>;
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
  skillMappings?: Array<{
    skillId: string;
    skillName: string;
    positionId: string;
    positionName: string;
    weight: number;
  }>;
}

export interface QuizForAttempt {
  id: string;
  title: string;
  positionId: string | null;
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
  submittedAt: string;
}

export interface QuizAttemptHistoryItem {
  attemptId: string;
  quizId: string;
  lessonId: string | null;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  submittedAt: string;
  answers: AnswerResult[];
  detailAnswers: QuizAttemptDetailAnswer[];
}

export interface QuizAttemptDetailAnswer {
  questionId: string;
  questionText: string;
  selectedIndex: number | null;
  selectedAnswer: string | null;
  correctIndex: number | null;
  correctAnswer: string | null;
  isCorrect: boolean;
  explanation: string | null;
}
