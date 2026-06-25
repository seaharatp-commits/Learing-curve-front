"use client";

import { Card, CardBody, type CardProps } from "@heroui/react";

interface BaseCardProps extends CardProps {
  children?: React.ReactNode;
}

export default function BaseCard({ radius = "lg", className = "", children, ...props }: BaseCardProps) {
  return (
    <Card radius={radius} className={className} {...props}>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
