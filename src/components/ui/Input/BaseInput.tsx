"use client";

import { Input, type InputProps } from "@heroui/react";

export default function BaseInput({
  radius = "lg",
  variant = "bordered",
  size = "md",
  ...props
}: InputProps) {
  return <Input radius={radius} variant={variant} size={size} {...props} />;
}
