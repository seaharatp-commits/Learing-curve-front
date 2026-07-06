"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSkillRadarPositions } from "@/services/skill-radar.service";

export const ADMIN_SKILL_RADAR_POSITIONS_QUERY_KEY = ["adminSkillRadarPositions"] as const;

export const useAdminSkillRadarPositions = () => {
  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ADMIN_SKILL_RADAR_POSITIONS_QUERY_KEY,
    queryFn: getAdminSkillRadarPositions,
  });

  return { data, isLoading, isError, error };
};
