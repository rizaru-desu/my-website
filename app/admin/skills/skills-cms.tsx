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
  createSkillDefaultValues,
  skillSeedRecords,
  type SkillRecord,
} from "./skill.default-values";
import { SkillEditorPanel } from "./skill-editor-panel";
import { SkillList } from "./skill-list";
import type { SkillFormValues } from "./skill.schema";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; skillId: string }
  | null;

type FlashState = {
  title: string;
  detail: string;
  tone: "blue" | "red" | "cream";
};

function createSkillId(name: string) {
  return `skill-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
}

export function SkillsCms() {
  const [items, setItems] = useState(skillSeedRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [skillPendingDelete, setSkillPendingDelete] = useState<SkillRecord | null>(null);
  const [flash, setFlash] = useState<FlashState | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 550);

    return () => window.clearTimeout(timeout);
  }, []);

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

  async function handleSubmit(values: SkillFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (editorState?.mode === "edit" && editingSkill) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingSkill.id
            ? {
                ...item,
                values,
              }
            : item,
        ),
      );

      setFlash({
        title: "Skill updated",
        detail: `${values.name} was updated in the local skills board.`,
        tone: "blue",
      });
    } else {
      setItems((currentItems) => [
        {
          id: createSkillId(values.name),
          values,
        },
        ...currentItems,
      ]);

      setFlash({
        title: "Skill created",
        detail: `${values.name} was added to the local skills board.`,
        tone: "red",
      });
    }

    setEditorState(null);
  }

  async function handleConfirmDelete() {
    if (!skillPendingDelete) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 420));

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== skillPendingDelete.id),
    );
    setFlash({
      title: "Skill removed",
      detail: `${skillPendingDelete.values.name} was removed from the local skills board.`,
      tone: "cream",
    });
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

      <SkillList
        items={items}
        isLoading={isLoading}
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
                ? `${skillPendingDelete.values.name} will disappear from the grouped skills board. This is UI-only and not persisted anywhere.`
                : "Confirm removal of the selected skill entry."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="muted" onClick={() => setSkillPendingDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="ink" onClick={handleConfirmDelete}>
              Delete Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
