"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { learnFromIssue } from "@/services/issue.service";
import { ISSUE_LIST_QUERY_KEY } from "./useIssueList";
import { DASHBOARD_STATS_QUERY_KEY } from "@/hooks/dashboard";
import { KNOWLEDGE_BASE_LIST_QUERY_KEY } from "@/hooks/knowledgeBase";

export const useLearnFromIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => learnFromIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ISSUE_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_BASE_LIST_QUERY_KEY });
    },
  });
};
