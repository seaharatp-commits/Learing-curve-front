"use client";

import { useMutation } from "@tanstack/react-query";
import { generateKnowledge } from "@/services/knowledgeBase.service";

export const useGenerateKnowledge = () =>
  useMutation({
    mutationFn: generateKnowledge,
  });
