"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizList } from "@/services/learning.service";

export const QUIZ_LIST_QUERY_KEY = ["quizList"] as const;

export const useQuizList = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: QUIZ_LIST_QUERY_KEY,
    queryFn: getQuizList,
  });
  return { data: data ?? [], isLoading, isFetching, isError, error, refetch };
};
