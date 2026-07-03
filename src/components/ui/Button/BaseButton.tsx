"use client";

import { Button, type ButtonProps } from "@heroui/react";

interface BaseButtonProps extends ButtonProps {
  text?: string | React.ReactNode;
}

export default function BaseButton({
  color = "primary",
  radius = "md",
  size = "md",
  text,
  className = "",
  children,
  ...props
}: BaseButtonProps) {
  return (
    <Button
      color={color}
      radius={radius}
      size={size}
      className={`font-medium shadow-sm data-[hover=true]:opacity-95 dark:shadow-[0_10px_28px_rgba(0,0,0,0.24)] ${className}`}
      {...props}
    >
      {text ?? children}
    </Button>
  );
}
