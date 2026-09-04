"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPositionSkill,
  createPositionSkills,
  createSkillRadarPosition,
  updatePositionSkill,
  updateSkillRadarPosition,
} from "@/services/skill-radar.service";
import type { PositionPayload, PositionSkillPayload } from "@/types/app/skillRadar";
import { ADMIN_SKILL_RADAR_POSITIONS_QUERY_KEY } from "./useAdminSkillRadarPositions";

export const useAdminSkillRadarMutations = () => {
  const queryClient = useQueryClient();
  const invalidatePositions = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_SKILL_RADAR_POSITIONS_QUERY_KEY });

  const createPositionMutation = useMutation({
    mutationFn: (payload: PositionPayload) => createSkillRadarPosition(payload),
    onSuccess: invalidatePositions,
  });

  const updatePositionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PositionPayload }) =>
      updateSkillRadarPosition(id, payload),
    onSuccess: invalidatePositions,
  });

  const createSkillMutation = useMutation({
    mutationFn: ({ positionId, payload }: { positionId: string; payload: PositionSkillPayload }) =>
      createPositionSkill(positionId, payload),
    onSuccess: invalidatePositions,
  });

  const createSkillsMutation = useMutation({
    mutationFn: ({ positionId, payload }: { positionId: string; payload: PositionSkillPayload[] }) =>
      createPositionSkills(positionId, payload),
    onSuccess: invalidatePositions,
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PositionSkillPayload }) =>
      updatePositionSkill(id, payload),
    onSuccess: invalidatePositions,
  });

  return {
    createPositionMutation,
    updatePositionMutation,
    createSkillMutation,
    createSkillsMutation,
    updateSkillMutation,
  };
};
