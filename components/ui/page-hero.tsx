import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  label: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function PageHero({
  label,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("relative", className)}>
      <div className="accent-plate left-8 top-10 hidden h-20 w-20 -rotate-6 rounded-[28px] bg-accent-red lg:block" />
      <div className="accent-plate bottom-0 right-8 hidden h-16 w-28 rotate-6 rounded-[28px] bg-accent-blue lg:block" />
      <Card className="relative overflow-hidden bg-panel px-6 py-10 sm:px-8 sm:py-12">
        <div className="relative z-10 max-w-4xl space-y-6">
          <span className="section-label">{label}</span>
          <div className="space-y-4">
            <h1 className="font-display text-5xl uppercase leading-none tracking-tight text-ink sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-ink/75 sm:text-lg">
              {description}
            </p>
          </div>
          {children}
        </div>
      </Card>
    </section>
  );
}
