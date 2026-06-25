export interface DashboardStats {
  totalChats: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  knowledgeBaseCount: number;
  issuesByCategory: { category: string; count: number }[];
}
