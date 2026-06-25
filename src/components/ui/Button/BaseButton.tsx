"use client";

import { Button, type ButtonProps } from "@heroui/react";

interface BaseButtonProps extends ButtonProps {
  text?: string | React.ReactNode;
}

export default function BaseButton({
  color = "primary",
  radius = "lg",
  size = "md",
  text,
  className = "",
  children,
  ...props
}: BaseButtonProps) {
  return (
    <Button color={color} radius={radius} size={size} className={className} {...props}>
      {text ?? children}
    </Button>
  );
}
