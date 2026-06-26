export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ModalMode = "create" | "edit" | "view";

export interface KnowledgeBaseFormValues {
  title: string;
  category: string;
  content: string;
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
  summary: string | null;
  resolution: string | null;
  confidenceScore: number;
  matchedKeywords: string[];
  sameCategory: boolean;
  explanation: string;
}
