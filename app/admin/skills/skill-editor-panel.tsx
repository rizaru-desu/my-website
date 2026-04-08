"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { SkillForm } from "./skill-form";
import type { SkillFormValues } from "./skill.schema";

type SkillEditorPanelProps = {
  defaultValues: SkillFormValues;
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSubmit: (values: SkillFormValues) => Promise<void>;
};

const SKILL_EDITOR_WIDTH_KEY = "skill-editor-width";

function getWidthBounds(viewportWidth: number) {
  const maxWidth = Math.floor(viewportWidth * 0.8);
  const minWidth = Math.min(360, maxWidth);

  return { maxWidth, minWidth };
}

function clampWidth(nextWidth: number, viewportWidth: number) {
  const { minWidth, maxWidth } = getWidthBounds(viewportWidth);
  return Math.min(Math.max(nextWidth, minWidth), maxWidth);
}

export function SkillEditorPanel({
  defaultValues,
  mode,
  open,
  onOpenChange,
  onCancel,
  onDelete,
  onSubmit,
}: SkillEditorPanelProps) {
  const [panelWidth, setPanelWidth] = useState(440);
  const [isEntered, setIsEntered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const pointerOffsetRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedWidth = window.localStorage.getItem(SKILL_EDITOR_WIDTH_KEY);

    if (!savedWidth) {
      setPanelWidth(clampWidth(440, window.innerWidth));
      return;
    }

    const parsedWidth = Number(savedWidth);

    if (!Number.isFinite(parsedWidth)) {
      setPanelWidth(clampWidth(440, window.innerWidth));
      return;
    }

    setPanelWidth(clampWidth(parsedWidth, window.innerWidth));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SKILL_EDITOR_WIDTH_KEY, String(panelWidth));
  }, [panelWidth]);

  useEffect(() => {
    if (!open) {
      setIsEntered(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsEntered(true));

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setPanelWidth((currentWidth) => clampWidth(currentWidth, window.innerWidth));
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isResizing || typeof window === "undefined") {
      return;
    }

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth = window.innerWidth - event.clientX + pointerOffsetRef.current;
      setPanelWidth(clampWidth(nextWidth, window.innerWidth));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "max-w-none overflow-hidden p-0 transition-[transform,opacity] duration-200 ease-out",
          isEntered ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
        )}
        style={{
          width: panelWidth,
          maxWidth: "80vw",
        }}
      >
        <button
          type="button"
          aria-label="Resize skill editor"
          className="absolute inset-y-0 left-0 z-20 w-4 -translate-x-1/2 cursor-col-resize"
          onPointerDown={(event) => {
            event.preventDefault();
            pointerOffsetRef.current = panelWidth - (window.innerWidth - event.clientX);
            setIsResizing(true);
          }}
        >
          <span className="absolute inset-y-10 left-1/2 w-1 -translate-x-1/2 rounded-full bg-ink/30 transition hover:bg-accent-blue" />
        </button>

        <div className="h-full overflow-y-auto px-5 py-6 sm:px-8">
          <div className="space-y-6">
            <SheetHeader>
              <div className="flex flex-wrap gap-3">
                <Badge variant={mode === "create" ? "blue" : "red"}>
                  {mode === "create" ? "Add Skill" : "Edit Skill"}
                </Badge>
                <Badge variant="cream">Skills Workspace</Badge>
              </div>
              <SheetTitle>
                {mode === "create"
                  ? "Add a new capability entry."
                  : "Refine the selected skill entry."}
              </SheetTitle>
              <SheetDescription>
                A lightweight editor for grouping, leveling, and featuring skills across
                the public portfolio.
              </SheetDescription>
            </SheetHeader>

            <Separator />

            <SkillForm
              defaultValues={defaultValues}
              mode={mode}
              onCancel={onCancel}
              onDelete={onDelete}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
