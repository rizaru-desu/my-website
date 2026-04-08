"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createProjectDefaultValues,
  formatProjectUpdatedAt,
  projectSeedRecords,
  type ProjectRecord,
} from "./project.default-values";
import { ProjectEditorSheet } from "./project-editor-sheet";
import { ProjectList } from "./project-list";
import type { ProjectFormValues } from "./project.schema";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; projectId: string }
  | null;

type FlashState = {
  title: string;
  detail: string;
  tone: "blue" | "red" | "cream";
};

function createProjectId(slug: string) {
  return `project-${slug}-${Date.now()}`;
}

function createDuplicateValues(project: ProjectRecord): ProjectFormValues {
  return {
    ...project.values,
    title: `${project.values.title} Copy`,
    slug: `${project.values.slug}-copy`,
    featured: false,
    status: "draft",
    sortOrder: "",
  };
}

export function ProjectsCms() {
  const [items, setItems] = useState(projectSeedRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<ProjectRecord | null>(null);
  const [flash, setFlash] = useState<FlashState | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 650);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!flash) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFlash(null), 3600);

    return () => window.clearTimeout(timeout);
  }, [flash]);

  const editingProject = useMemo(() => {
    if (!editorState || editorState.mode !== "edit") {
      return null;
    }

    return items.find((item) => item.id === editorState.projectId) ?? null;
  }, [editorState, items]);

  const editorDefaultValues = editingProject?.values ?? createProjectDefaultValues();

  async function handleSubmit(values: ProjectFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editorState?.mode === "edit" && editingProject) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingProject.id
            ? {
                ...item,
                values,
                lastUpdated: formatProjectUpdatedAt(),
              }
            : item,
        ),
      );

      setFlash({
        title: "Project updated",
        detail: `${values.title} was saved to the local project archive.`,
        tone: "blue",
      });
    } else {
      setItems((currentItems) => [
        {
          id: createProjectId(values.slug),
          values,
          lastUpdated: formatProjectUpdatedAt(),
        },
        ...currentItems,
      ]);

      setFlash({
        title: "Project created",
        detail: `${values.title} was added to the project directory.`,
        tone: "red",
      });
    }

    setEditorState(null);
  }

  async function handleConfirmDelete() {
    if (!projectPendingDelete) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 450));

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== projectPendingDelete.id),
    );
    setFlash({
      title: "Project removed",
      detail: `${projectPendingDelete.values.title} was removed from the project view.`,
      tone: "cream",
    });
    setProjectPendingDelete(null);

    if (
      editorState?.mode === "edit" &&
      editorState.projectId === projectPendingDelete.id
    ) {
      setEditorState(null);
    }
  }

  function handleDuplicateProject(project: ProjectRecord) {
    const duplicatedValues = createDuplicateValues(project);

    setItems((currentItems) => [
      {
        id: createProjectId(duplicatedValues.slug),
        values: duplicatedValues,
        lastUpdated: formatProjectUpdatedAt(),
      },
      ...currentItems,
    ]);
    setFlash({
      title: "Project duplicated",
      detail: `${project.values.title} was copied into a new draft entry.`,
      tone: "blue",
    });
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <Card accent={flash.tone}>
          <CardContent className="space-y-2">
            <Badge variant={flash.tone === "cream" ? "yellow" : flash.tone}>
              Editor Feedback
            </Badge>
            <CardTitle>{flash.title}</CardTitle>
            <CardDescription>{flash.detail}</CardDescription>
          </CardContent>
        </Card>
      ) : null}

      <ProjectList
        items={items}
        isLoading={isLoading}
        onAddProject={() => setEditorState({ mode: "create" })}
        onEditProject={(project) =>
          setEditorState({ mode: "edit", projectId: project.id })
        }
        onDeleteProject={(project) => setProjectPendingDelete(project)}
        onDuplicateProject={handleDuplicateProject}
      />

      <ProjectEditorSheet
        open={Boolean(editorState)}
        mode={editorState?.mode ?? "create"}
        defaultValues={editorDefaultValues}
        onOpenChange={(open) => {
          if (!open) {
            setEditorState(null);
          }
        }}
        onCancel={() => setEditorState(null)}
        onDelete={
          editingProject ? () => setProjectPendingDelete(editingProject) : undefined
        }
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(projectPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setProjectPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <Badge variant="red">Delete Confirmation</Badge>
            <DialogTitle>Remove this project from the workspace?</DialogTitle>
            <DialogDescription>
              {projectPendingDelete
                ? `${projectPendingDelete.values.title} will disappear from the current project directory. This change only affects this session.`
                : "Confirm removal of the selected project entry."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="muted" onClick={() => setProjectPendingDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="ink" onClick={handleConfirmDelete}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
