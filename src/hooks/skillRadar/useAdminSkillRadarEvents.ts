"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSkillRadarEvents } from "@/services/skill-radar.service";
import type { AdminSkillScoreEventFilters } from "@/types/app/skillRadar";

export const adminSkillRadarEventsQueryKey = (filters: AdminSkillScoreEventFilters = {}) =>
  ["adminSkillRadarEvents", filters] as const;

export const useAdminSkillRadarEvents = (filters: AdminSkillScoreEventFilters = {}) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminSkillRadarEventsQueryKey(filters),
    queryFn: () => getAdminSkillRadarEvents(filters),
  });

  return {
    data: data ?? { items: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 30, totalPages: 1 },
    isLoading,
    isError,
    error,
    refetch,
  };
};
