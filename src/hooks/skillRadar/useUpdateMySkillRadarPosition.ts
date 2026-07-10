"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMySkillRadarPosition } from "@/services/skill-radar.service";
import { CAREER_ALIGNMENT_QUERY_KEY } from "./useCareerAlignment";
import { mySkillRadarQueryKey } from "./useMySkillRadar";

export const useUpdateMySkillRadarPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionId: string) => updateMySkillRadarPosition(positionId),
    onSuccess: (radar) => {
      queryClient.setQueryData(mySkillRadarQueryKey(), radar);
      queryClient.invalidateQueries({ queryKey: ["mySkillRadar"] });
      queryClient.invalidateQueries({ queryKey: CAREER_ALIGNMENT_QUERY_KEY });
    },
  });
};
