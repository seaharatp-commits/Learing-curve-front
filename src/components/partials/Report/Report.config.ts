import type { IssueFormValues, IssuePriority } from "@/types/app/issue";

export const ISSUE_CATEGORIES = ["บัญชีผู้ใช้", "การเข้าสู่ระบบ", "การเชื่อมต่อ", "อื่นๆ"];

export const ISSUE_PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH"];

export const DEFAULT_ISSUE_FORM: IssueFormValues = {
  title: "",
  description: "",
  category: ISSUE_CATEGORIES[0],
  priority: "MEDIUM",
  reporterName: "",
  reporterEmail: "",
};
