import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-[24px] border-[3px] border-ink bg-white/85 px-4 py-3 text-sm font-medium text-ink shadow-[5px_5px_0_var(--ink)] outline-none transition focus-visible:ring-4 focus-visible:ring-accent-blue/30 disabled:cursor-not-allowed disabled:opacity-55",
        "placeholder:text-ink/45",
        className,
      )}
      {...props}
    />
  );
}
