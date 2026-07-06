"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setQuestionSkillMappings } from "@/services/skill-radar.service";
import type { QuestionSkillMappingPayload } from "@/types/app/skillRadar";

export const useSetQuestionSkillMappings = (quizId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      mappings,
    }: {
      questionId: string;
      mappings: QuestionSkillMappingPayload[];
    }) => setQuestionSkillMappings(questionId, mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
};
