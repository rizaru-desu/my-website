import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EditorialCardProps = {
  children: ReactNode;
  accent?: "red" | "blue" | "cream";
  className?: string;
};

export function EditorialCard({
  children,
  accent = "cream",
  className,
}: EditorialCardProps) {
  return (
    <Card accent={accent} className={className}>
      {children}
    </Card>
  );
}
