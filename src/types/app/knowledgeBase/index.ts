export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  content: string;
  summary?: string | null;
  keywords?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseFormValues {
  title: string;
  category: string;
  content: string;
  summary?: string;
  keywords?: string[];
  tags?: string[];
}

export interface RecommendQuery {
  title: string;
  description?: string;
  category?: string;
}

export interface RecommendationResult {
  articleId: string;
  title: string;
  category: string;
  preview: string;
  summary: string | null;
  resolution: string | null;
  confidenceScore: number;
  matchedKeywords: string[];
  sameCategory: boolean;
  explanation: string;
}

export interface KnowledgeDraft {
  title: string;
  summary: string;
  symptoms: string;
  environment: string;
  rootCause: string;
  resolution: string;
  verification: string;
  keywords: string[];
  tags: string[];
  category: string;
}

export interface GenerateKnowledgeResult {
  draft: KnowledgeDraft;
  originalText: string;
  similarArticles: RecommendationResult[];
}

export interface ConfirmKnowledgePayload extends KnowledgeDraft {
  originalText: string;
  targetArticleId?: string;
}
