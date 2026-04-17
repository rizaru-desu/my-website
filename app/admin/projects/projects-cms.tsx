"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import { createProjectDefaultValues } from "./project.default-values";
import { ProjectEditorSheet } from "./project-editor-sheet";
import { ProjectList } from "./project-list";
import type { ProjectFormValues } from "./project.schema";
import {
  adminProjectsQueryKey,
  createAdminProjectRequest,
  deleteAdminProjectRequest,
  fetchAdminProjects,
  updateAdminProjectRequest,
} from "./projects.queries";
import type { AdminProjectRecord } from "@/lib/projects.shared";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; projectId: string }
  | null;

type FlashState = {
  title: string;
  detail: string;
  tone: "blue" | "red" | "cream";
};

function sanitizeDuplicateSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDuplicateValues(
  project: AdminProjectRecord,
  items: AdminProjectRecord[],
): ProjectFormValues {
  const baseSlug = sanitizeDuplicateSlug(`${project.values.slug}-copy`);
  const existingSlugs = new Set(items.map((item) => item.values.slug));
  let nextSlug = baseSlug || "project-copy";
  let suffix = 2;

  while (existingSlugs.has(nextSlug)) {
    nextSlug = `${baseSlug || "project-copy"}-${suffix}`;
    suffix += 1;
  }

  return {
    ...project.values,
    title: `${project.values.title} Copy`,
    slug: nextSlug,
    featured: false,
    status: "draft",
    sortOrder: "",
  };
}

export function ProjectsCms() {
  const queryClient = useQueryClient();
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<AdminProjectRecord | null>(
    null,
  );
  const [flash, setFlash] = useState<FlashState | null>(null);
  const {
    data: items = [],
    error,
    isFetching,
    isLoading,
  } = useQuery({
    queryFn: fetchAdminProjects,
    queryKey: adminProjectsQueryKey,
    refetchOnWindowFocus: false,
  });

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
  const createMutation = useMutation({
    mutationFn: createAdminProjectRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Project created",
        tone: "red",
      });
      await queryClient.invalidateQueries({ queryKey: adminProjectsQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The project could not be created right now.",
        title: "Create failed",
        tone: "red",
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateAdminProjectRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Project updated",
        tone: "blue",
      });
      await queryClient.invalidateQueries({ queryKey: adminProjectsQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The project could not be updated right now.",
        title: "Update failed",
        tone: "red",
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminProjectRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Project removed",
        tone: "cream",
      });
      await queryClient.invalidateQueries({ queryKey: adminProjectsQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The project could not be deleted right now.",
        title: "Delete failed",
        tone: "red",
      });
    },
  });

  async function handleSubmit(values: ProjectFormValues) {
    if (editorState?.mode === "edit" && editingProject) {
      await updateMutation.mutateAsync({
        id: editingProject.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    setEditorState(null);
  }

  async function handleConfirmDelete() {
    if (!projectPendingDelete) {
      return;
    }

    await deleteMutation.mutateAsync(projectPendingDelete.id);
    setProjectPendingDelete(null);

    if (
      editorState?.mode === "edit" &&
      editorState.projectId === projectPendingDelete.id
    ) {
      setEditorState(null);
    }
  }

  async function handleDuplicateProject(project: AdminProjectRecord) {
    const duplicatedValues = createDuplicateValues(project, items);
    await createMutation.mutateAsync(duplicatedValues);
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

      {error ? (
        <Card accent="red">
          <CardContent className="space-y-2">
            <Badge variant="red">Projects Unavailable</Badge>
            <CardTitle>The projects database could not be loaded.</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "The projects board could not be loaded right now."}
            </CardDescription>
          </CardContent>
        </Card>
      ) : null}

      <ProjectList
        items={items}
        isLoading={isLoading || isFetching}
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
                ? `${projectPendingDelete.values.title} will be removed from the live project archive.`
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
