"use client";

import { useQuery } from "@tanstack/react-query";
import { getSkillRadarPositions } from "@/services/skill-radar.service";

export const SKILL_RADAR_POSITIONS_QUERY_KEY = ["skillRadarPositions"] as const;

export const useSkillRadarPositions = () => {
  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: SKILL_RADAR_POSITIONS_QUERY_KEY,
    queryFn: getSkillRadarPositions,
  });

  return { data, isLoading, isError, error };
};
