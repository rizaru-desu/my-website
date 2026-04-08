"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "blue"
  | "muted"
  | "ink"
  | "ghost"
  | "outline";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  children: ReactNode;
};

export function buttonVariants({
  variant = "default",
  size = "default",
  active = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-[3px] border-ink font-semibold uppercase tracking-[0.2em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
    "shadow-[5px_5px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--ink)]",
    size === "default" && "px-4 py-2.5 text-xs sm:text-[0.76rem]",
    size === "sm" && "px-3.5 py-2 text-[0.68rem]",
    size === "lg" && "px-5 py-3 text-[0.8rem]",
    size === "icon" && "h-11 w-11 p-0 text-sm",
    variant === "default" && "bg-accent-red text-white",
    variant === "blue" && "bg-accent-blue text-white",
    variant === "muted" && "bg-white/70 text-ink",
    variant === "ink" && "bg-ink text-panel",
    variant === "ghost" && "bg-transparent text-ink shadow-none hover:bg-white/40 hover:shadow-none",
    variant === "outline" && "bg-panel text-ink",
    active && "bg-accent-blue text-white",
  );
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  active = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, active }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
