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

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within <Dialog />");
  }
  return context;
}

type DialogProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Dialog({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, ...props }: ButtonProps) {
  const { setOpen } = useDialogContext();

  return (
    <Button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </Button>
  );
}

export function DialogClose({ children, ...props }: ButtonProps) {
  const { setOpen } = useDialogContext();

  return (
    <Button type="button" variant="muted" onClick={() => setOpen(false)} {...props}>
      {children}
    </Button>
  );
}

type DialogContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext();

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-[30px] border-[3px] border-ink bg-panel p-6 shadow-[10px_10px_0_var(--ink)]",
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

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-display text-4xl uppercase leading-none text-ink", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-7 text-ink/75", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-wrap gap-3", className)} {...props} />;
}
