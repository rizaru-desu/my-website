"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type MouseEventHandler,
  type FocusEventHandler,
  type ReactNode,
} from "react";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within <Tooltip />");
  }
  return context;
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <TooltipContext.Provider value={value}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild = false,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const { setOpen } = useTooltipContext();
  const Comp = asChild ? Slot : "div";

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
    onMouseEnter?.(event);
    setOpen(true);
  };

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
    onMouseLeave?.(event);
    setOpen(false);
  };

  const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
    onFocus?.(event);
    setOpen(true);
  };

  const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    onBlur?.(event);
    setOpen(false);
  };

  return (
    <Comp
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function TooltipContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open } = useTooltipContext();

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute left-1/2 top-[calc(100%+0.75rem)] z-[70] -translate-x-1/2 rounded-[18px] border-[3px] border-ink bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-panel shadow-[5px_5px_0_var(--accent-red)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
