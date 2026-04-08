"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLSpanElement | null>;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu />");
  }
  return context;
}

type DropdownMenuProps = {
  children: ReactNode;
};

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const value = useMemo(
    () => ({ open, setOpen, contentRef, triggerRef }),
    [open],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  variant,
  ...props
}: ButtonProps) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  return (
    <span ref={triggerRef} className="inline-flex">
      <Button
        type="button"
        variant={open ? "blue" : variant ?? "muted"}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
      </Button>
    </span>
  );
}

type DropdownMenuAlign = "start" | "center" | "end";
type DropdownMenuSide = "top" | "bottom";

export function DropdownMenuContent({
  className,
  align = "end",
  collisionPadding = 16,
  side = "bottom",
  sideOffset = 12,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  align?: DropdownMenuAlign;
  collisionPadding?: number;
  side?: DropdownMenuSide;
  sideOffset?: number;
}) {
  const { open, contentRef, triggerRef } = useDropdownMenuContext();
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    const triggerElement = triggerRef.current;
    const contentElement = contentRef.current;

    if (!open || !triggerElement || !contentElement) {
      return undefined;
    }

    let frameId = 0;
    let cancelled = false;

    const updatePosition = () => {
      if (
        cancelled ||
        !document.body.contains(triggerElement) ||
        !document.body.contains(contentElement)
      ) {
        return;
      }

      const triggerRect = triggerElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();

      if (!triggerRect.width || !contentRect.width) {
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom - collisionPadding;
      const spaceAbove = triggerRect.top - collisionPadding;
      const shouldOpenTop =
        side === "top" ||
        (spaceBelow < contentRect.height + sideOffset &&
          spaceAbove > contentRect.height + sideOffset);

      let left =
        align === "start"
          ? triggerRect.left
          : align === "center"
            ? triggerRect.left + (triggerRect.width - contentRect.width) / 2
            : triggerRect.right - contentRect.width;

      const unclampedTop = shouldOpenTop
        ? triggerRect.top - contentRect.height - sideOffset
        : triggerRect.bottom + sideOffset;

      left = Math.min(
        Math.max(left, collisionPadding),
        viewportWidth - contentRect.width - collisionPadding,
      );

      const top = Math.min(
        Math.max(unclampedTop, collisionPadding),
        viewportHeight - contentRect.height - collisionPadding,
      );

      if (!cancelled) {
        setPosition({ left, top });
      }
    };

    frameId = window.requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, collisionPadding, open, side, sideOffset, triggerRef, contentRef]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "fixed z-[70] min-w-60 rounded-[24px] border-[3px] border-ink bg-panel p-2 shadow-[8px_8px_0_var(--ink)]",
        className,
      )}
      style={{
        left: position?.left ?? collisionPadding,
        top: position?.top ?? collisionPadding,
      }}
      {...props}
    />,
    document.body,
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/55",
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuItemProps = HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  inset?: boolean;
};

export function DropdownMenuItem({
  className,
  asChild = false,
  inset = false,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();
  const itemClassName = cn(
    "flex w-full items-center rounded-[18px] border-[3px] border-transparent px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink hover:bg-yellow-200/60",
    inset && "pl-8",
    className,
  );

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);
    setOpen(false);
  };

  if (asChild) {
    return (
      <Slot className={itemClassName} onClick={() => setOpen(false)} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type="button"
      className={itemClassName}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-2 h-0 border-t-[3px] border-dashed border-ink/20", className)} {...props} />;
}
