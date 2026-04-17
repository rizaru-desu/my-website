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

import {
  createSkillDefaultValues,
} from "./skill.default-values";
import { SkillEditorPanel } from "./skill-editor-panel";
import { SkillList } from "./skill-list";
import type { SkillFormValues } from "./skill.schema";
import type { SkillRecord } from "@/lib/skills.shared";
import {
  adminSkillsQueryKey,
  createAdminSkillRequest,
  deleteAdminSkillRequest,
  fetchAdminSkills,
  updateAdminSkillRequest,
} from "./skills.queries";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; skillId: string }
  | null;

type FlashState = {
  title: string;
  detail: string;
  tone: "blue" | "red" | "cream";
};

export function SkillsCms() {
  const queryClient = useQueryClient();
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [skillPendingDelete, setSkillPendingDelete] = useState<SkillRecord | null>(null);
  const [flash, setFlash] = useState<FlashState | null>(null);
  const {
    data: items = [],
    error,
    isFetching,
    isLoading,
  } = useQuery({
    queryFn: fetchAdminSkills,
    queryKey: adminSkillsQueryKey,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!flash) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFlash(null), 3200);

    return () => window.clearTimeout(timeout);
  }, [flash]);

  const editingSkill = useMemo(() => {
    if (!editorState || editorState.mode !== "edit") {
      return null;
    }

    return items.find((item) => item.id === editorState.skillId) ?? null;
  }, [editorState, items]);

  const editorDefaultValues = editingSkill?.values ?? createSkillDefaultValues();
  const createMutation = useMutation({
    mutationFn: createAdminSkillRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Skill created",
        tone: "red",
      });
      await queryClient.invalidateQueries({ queryKey: adminSkillsQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The skill could not be created right now.",
        title: "Create failed",
        tone: "red",
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateAdminSkillRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Skill updated",
        tone: "blue",
      });
      await queryClient.invalidateQueries({ queryKey: adminSkillsQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The skill could not be updated right now.",
        title: "Update failed",
        tone: "red",
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminSkillRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Skill removed",
        tone: "cream",
      });
      await queryClient.invalidateQueries({ queryKey: adminSkillsQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The skill could not be deleted right now.",
        title: "Delete failed",
        tone: "red",
      });
    },
  });

  async function handleSubmit(values: SkillFormValues) {
    if (editorState?.mode === "edit" && editingSkill) {
      await updateMutation.mutateAsync({
        id: editingSkill.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    setEditorState(null);
  }

  async function handleConfirmDelete() {
    if (!skillPendingDelete) {
      return;
    }

    await deleteMutation.mutateAsync(skillPendingDelete.id);
    setSkillPendingDelete(null);

    if (editorState?.mode === "edit" && editorState.skillId === skillPendingDelete.id) {
      setEditorState(null);
    }
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
            <Badge variant="red">Skills Unavailable</Badge>
            <CardTitle>The skills database could not be loaded.</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "The skills board could not be loaded right now."}
            </CardDescription>
          </CardContent>
        </Card>
      ) : null}

      <SkillList
        items={items}
        isLoading={isLoading || isFetching}
        onAddSkill={() => setEditorState({ mode: "create" })}
        onEditSkill={(skill) => setEditorState({ mode: "edit", skillId: skill.id })}
        onDeleteSkill={(skill) => setSkillPendingDelete(skill)}
      />

      <SkillEditorPanel
        open={Boolean(editorState)}
        mode={editorState?.mode ?? "create"}
        defaultValues={editorDefaultValues}
        onOpenChange={(open) => {
          if (!open) {
            setEditorState(null);
          }
        }}
        onCancel={() => setEditorState(null)}
        onDelete={editingSkill ? () => setSkillPendingDelete(editingSkill) : undefined}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(skillPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setSkillPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <Badge variant="red">Delete Confirmation</Badge>
            <DialogTitle>Remove this skill from the skills workspace?</DialogTitle>
            <DialogDescription>
              {skillPendingDelete
                ? `${skillPendingDelete.values.name} will be removed from the persisted skills board.`
                : "Confirm removal of the selected skill entry."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="muted" onClick={() => setSkillPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ink"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
