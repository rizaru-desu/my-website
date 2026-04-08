"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />");
  }
  return context;
}

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const contextValue = useMemo(() => ({ value, setValue }), [value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("space-y-5", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-3 rounded-[28px] border-[3px] border-ink bg-panel p-2 shadow-[6px_6px_0_var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({
  className,
  value,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: currentValue, setValue } = useTabsContext();
  const active = currentValue === value;

  return (
    <button
      type="button"
      className={cn(
        "rounded-full border-[3px] border-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all",
        active
          ? "bg-accent-blue text-white shadow-[4px_4px_0_var(--ink)]"
          : "bg-white/70 text-ink hover:bg-yellow-200/80",
        className,
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const { value: currentValue } = useTabsContext();

  if (currentValue !== value) {
    return null;
  }

  return (
    <div className={cn("space-y-5", className)} {...props}>
      {children}
    </div>
  );
}
