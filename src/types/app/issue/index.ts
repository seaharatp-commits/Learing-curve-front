export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: IssuePriority;
  status: IssueStatus;
  reporterName: string;
  reporterEmail: string;
  createdAt: string;
}

export interface IssueFormValues {
  title: string;
  description: string;
  category: string;
  priority: IssuePriority;
  reporterName: string;
  reporterEmail: string;
}
