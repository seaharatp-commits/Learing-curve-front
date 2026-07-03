"use client";

import { Card, CardBody, type CardProps } from "@heroui/react";

interface BaseCardProps extends CardProps {
  children?: React.ReactNode;
}

export default function BaseCard({ radius = "md", className = "", children, ...props }: BaseCardProps) {
  return (
    <Card
      radius={radius}
      className={`border border-default-200/70 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#11161d]/78 dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)] dark:backdrop-blur-xl ${className}`}
      {...props}
    >
      <CardBody>{children}</CardBody>
    </Card>
  );
}
