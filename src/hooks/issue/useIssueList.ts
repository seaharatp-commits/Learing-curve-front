"use client";

import { useQuery } from "@tanstack/react-query";
import { getIssueList } from "@/services/issue.service";

export const ISSUE_LIST_QUERY_KEY = ["issueList"] as const;

export const useIssueList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ISSUE_LIST_QUERY_KEY,
    queryFn: getIssueList,
  });
  return { data: data ?? [], isLoading };
};
