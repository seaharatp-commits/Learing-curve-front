"use client";

import { useQuery } from "@tanstack/react-query";
import { getHistoryList } from "@/services/history.service";

export const HISTORY_LIST_QUERY_KEY = ["historyList"] as const;

export const useHistoryList = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: HISTORY_LIST_QUERY_KEY,
    queryFn: getHistoryList,
  });
  return { data: data ?? [], isLoading, isError, error };
};
