"use client";

import {
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type SlotProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Slot({ children, className, ...props }: SlotProps) {
  if (!isValidElement(children)) {
    return null;
  }

  const child = children as ReactElement<{ className?: string }>;

  return cloneElement(child, {
    ...props,
    className: cn(child.props.className, className),
  });
}
