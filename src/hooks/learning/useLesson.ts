"use client";

import { useQuery } from "@tanstack/react-query";
import { getLesson } from "@/services/learning.service";

export const lessonQueryKey = (lessonId: string) => ["lesson", lessonId] as const;

export const useLesson = (lessonId: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: lessonQueryKey(lessonId),
    queryFn: () => getLesson(lessonId),
    enabled: !!lessonId,
  });
  return { data, isLoading, isError, error };
};
