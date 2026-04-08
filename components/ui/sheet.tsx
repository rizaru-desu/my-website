"use client";

import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within <Sheet />");
  }
  return context;
}

type SheetProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Sheet({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, ...props }: ButtonProps) {
  const { setOpen } = useSheetContext();

  return (
    <Button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </Button>
  );
}

type SheetContentProps = HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right";
};

export function SheetContent({
  className,
  side = "right",
  children,
  ...props
}: SheetContentProps) {
  const { open, setOpen } = useSheetContext();

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[85] bg-ink/55 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close sheet"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "absolute top-0 z-10 h-full w-full max-w-sm border-[3px] border-ink bg-panel p-5 shadow-[10px_10px_0_var(--ink)]",
          side === "right" ? "right-0 rounded-l-[28px]" : "left-0 rounded-r-[28px]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("font-display text-4xl uppercase leading-none text-ink", className)} {...props} />
  );
}

export function SheetDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-7 text-ink/75", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-wrap gap-3", className)} {...props} />;
}

export function SheetClose({ children, ...props }: ButtonProps) {
  const { setOpen } = useSheetContext();

  return (
    <Button type="button" variant="muted" onClick={() => setOpen(false)} {...props}>
      {children}
    </Button>
  );
}
