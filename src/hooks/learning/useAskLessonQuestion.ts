"use client";

import { useMutation } from "@tanstack/react-query";
import { askLessonQuestion } from "@/services/learning.service";

export const useAskLessonQuestion = (lessonId: string) => {
  return useMutation({
    mutationFn: ({ message, chatHistory }: { message: string; chatHistory: string }) =>
      askLessonQuestion(lessonId, message, chatHistory),
  });
};
