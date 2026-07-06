"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSkillRadarEvents } from "@/services/skill-radar.service";

export const adminSkillRadarEventsQueryKey = (limit = 30) =>
  ["adminSkillRadarEvents", limit] as const;

export const useAdminSkillRadarEvents = (limit = 30) => {
  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: adminSkillRadarEventsQueryKey(limit),
    queryFn: () => getAdminSkillRadarEvents(limit),
  });

  return { data, isLoading, isError, error };
};
