import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SectionShellProps = {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionShell({
  label,
  title,
  description,
  children,
  className,
  contentClassName,
}: SectionShellProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <div className="space-y-4">
        <span className="section-label">{label}</span>
        <div className="max-w-3xl space-y-3">
          <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-base leading-7 text-ink/75 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        <Separator className="max-w-3xl" />
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
