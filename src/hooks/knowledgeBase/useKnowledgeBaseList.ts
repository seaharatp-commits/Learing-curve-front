"use client";

import { useQuery } from "@tanstack/react-query";
import { getKnowledgeBaseList } from "@/services/knowledgeBase.service";

export const KNOWLEDGE_BASE_LIST_QUERY_KEY = ["knowledgeBaseList"] as const;

export const useKnowledgeBaseList = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: KNOWLEDGE_BASE_LIST_QUERY_KEY,
    queryFn: getKnowledgeBaseList,
  });
  return { data: data ?? [], isLoading, refetch };
};
