import type { IssueFormValues, IssueReport } from "@/types/app/issue";
import { createIssueApi, getIssueListApi } from "@/lib/api/api-main";

export const createIssue = async (payload: IssueFormValues): Promise<IssueReport> => {
  const res = await createIssueApi(payload);
  return res.data;
};

export const getIssueList = async (): Promise<IssueReport[]> => {
  const res = await getIssueListApi();
  return res.data;
};
