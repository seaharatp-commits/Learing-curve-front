"use client";

import { useMutation } from "@tanstack/react-query";
import { createIssue } from "@/services/issue.service";

export const useCreateIssue = () =>
  useMutation({
    mutationFn: createIssue,
  });
