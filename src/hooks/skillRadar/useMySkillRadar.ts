"use client";

import { useQuery } from "@tanstack/react-query";
import { getMySkillRadar } from "@/services/skill-radar.service";

export const mySkillRadarQueryKey = (positionId?: string) =>
  ["mySkillRadar", positionId ?? "default"] as const;

export const useMySkillRadar = (positionId?: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: mySkillRadarQueryKey(positionId),
    queryFn: () => getMySkillRadar(positionId),
  });

  return { data, isLoading, isError, error };
};
