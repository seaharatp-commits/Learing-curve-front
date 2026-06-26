"use client";

import { useMutation } from "@tanstack/react-query";
import { getRecommendations } from "@/services/knowledgeBase.service";

export const useRecommendations = () =>
  useMutation({
    mutationFn: getRecommendations,
  });
