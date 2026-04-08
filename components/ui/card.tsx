import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardAccent = "default" | "red" | "blue" | "cream" | "ink";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  accent?: CardAccent;
};

export function Card({
  className,
  accent = "default",
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative rounded-[28px] border-[3px] border-ink bg-panel p-6 shadow-[8px_8px_0_var(--ink)]",
        accent === "red" && "bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)]",
        accent === "blue" && "bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)]",
        accent === "cream" && "bg-panel",
        accent === "ink" && "bg-ink text-panel shadow-[8px_8px_0_var(--accent-red)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-3xl uppercase leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-7 text-current/78", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3", className)} {...props} />;
}
