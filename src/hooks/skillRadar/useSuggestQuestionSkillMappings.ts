"use client";

import { useMutation } from "@tanstack/react-query";
import { getQuestionSkillSuggestions } from "@/services/skill-radar.service";

export const useSuggestQuestionSkillMappings = () =>
  useMutation({
    mutationFn: (questionId: string) => getQuestionSkillSuggestions(questionId),
  });
