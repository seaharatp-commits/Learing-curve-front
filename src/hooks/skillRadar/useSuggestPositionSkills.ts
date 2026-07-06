"use client";

import { useMutation } from "@tanstack/react-query";
import { getPositionSkillSuggestions } from "@/services/skill-radar.service";

export const useSuggestPositionSkills = () =>
  useMutation({
    mutationFn: (positionId: string) => getPositionSkillSuggestions(positionId),
  });
