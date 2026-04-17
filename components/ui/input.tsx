import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-[22px] border-[3px] border-ink bg-white/85 px-4 text-sm font-medium text-ink shadow-[5px_5px_0_var(--ink)] outline-none transition focus-visible:ring-4 focus-visible:ring-accent-blue/30 disabled:cursor-not-allowed disabled:opacity-55",
          "placeholder:text-ink/45",
          className,
        )}
        {...props}
      />
    );
  },
);
