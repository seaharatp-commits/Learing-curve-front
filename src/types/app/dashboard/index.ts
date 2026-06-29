export interface DashboardStats {
  totalChats: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  knowledgeBaseCount: number;
  quizCount: number;
  issuesByCategory: { category: string; count: number }[];
}
