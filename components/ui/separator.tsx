import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 border-ink/25",
        orientation === "horizontal"
          ? "h-0 w-full border-t-[3px] border-dashed"
          : "h-full w-0 border-l-[3px] border-dashed",
        className,
      )}
      {...props}
    />
  );
}
