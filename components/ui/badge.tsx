import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "red" | "blue" | "cream" | "yellow";
};

export function Badge({
  children,
  variant = "yellow",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border-[3px] border-ink px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] shadow-[4px_4px_0_var(--ink)]",
        variant === "yellow" && "bg-[#ffe776] text-ink",
        variant === "red" && "bg-accent-red text-white",
        variant === "blue" && "bg-accent-blue text-white",
        variant === "cream" && "bg-panel text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
