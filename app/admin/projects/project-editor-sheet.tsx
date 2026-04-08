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

import { ProjectForm } from "./project-form";
import type { ProjectFormValues } from "./project.schema";

type ProjectEditorSheetProps = {
  defaultValues: ProjectFormValues;
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
};

const PROJECT_EDITOR_WIDTH_KEY = "project-editor-width";

function getWidthBounds(viewportWidth: number) {
  const maxWidth = Math.floor(viewportWidth * 0.8);
  const minWidth = Math.min(360, maxWidth);

  return { maxWidth, minWidth };
}

function clampWidth(nextWidth: number, viewportWidth: number) {
  const { minWidth, maxWidth } = getWidthBounds(viewportWidth);
  return Math.min(Math.max(nextWidth, minWidth), maxWidth);
}

export function ProjectEditorSheet({
  defaultValues,
  mode,
  open,
  onOpenChange,
  onCancel,
  onDelete,
  onSubmit,
}: ProjectEditorSheetProps) {
  const [panelWidth, setPanelWidth] = useState(480);
  const [isEntered, setIsEntered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const pointerOffsetRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedWidth = window.localStorage.getItem(PROJECT_EDITOR_WIDTH_KEY);

    if (!savedWidth) {
      setPanelWidth(clampWidth(480, window.innerWidth));
      return;
    }

    const parsedWidth = Number(savedWidth);

    if (!Number.isFinite(parsedWidth)) {
      setPanelWidth(clampWidth(480, window.innerWidth));
      return;
    }

    setPanelWidth(clampWidth(parsedWidth, window.innerWidth));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PROJECT_EDITOR_WIDTH_KEY, String(panelWidth));
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
          aria-label="Resize project editor"
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
                  {mode === "create" ? "Add Project" : "Edit Project"}
                </Badge>
                <Badge variant="cream">Project Workspace</Badge>
              </div>
              <SheetTitle>
                {mode === "create"
                  ? "Build a new case-study entry."
                  : "Refine the selected project entry."}
              </SheetTitle>
              <SheetDescription>
                Structured like the profile editor, but tuned for project metadata,
                publishing state, and archive management.
              </SheetDescription>
            </SheetHeader>

            <Separator />

            <ProjectForm
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
