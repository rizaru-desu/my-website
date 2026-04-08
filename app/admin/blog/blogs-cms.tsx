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
  blogSeedRecords,
  createBlogDefaultValues,
  formatBlogUpdatedAt,
  type BlogRecord,
} from "./blog.default-values";
import { BlogEditorPanel } from "./blog-editor-panel";
import { BlogList } from "./blog-list";
import type { BlogFormValues } from "./blog.schema";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; postId: string }
  | null;

type FlashState = {
  title: string;
  detail: string;
  tone: "blue" | "red" | "cream";
};

function createBlogId(slug: string) {
  return `post-${slug}-${Date.now()}`;
}

function createDuplicateValues(post: BlogRecord): BlogFormValues {
  return {
    ...post.values,
    title: `${post.values.title} Copy`,
    slug: `${post.values.slug}-copy`,
    featured: false,
    status: "draft",
    publishDate: "",
  };
}

export function BlogsCms() {
  const [items, setItems] = useState(blogSeedRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<BlogRecord | null>(null);
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

  const editingPost = useMemo(() => {
    if (!editorState || editorState.mode !== "edit") {
      return null;
    }

    return items.find((item) => item.id === editorState.postId) ?? null;
  }, [editorState, items]);

  const editorDefaultValues = editingPost?.values ?? createBlogDefaultValues();

  async function handleSubmit(values: BlogFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editorState?.mode === "edit" && editingPost) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingPost.id
            ? {
                ...item,
                values,
                lastUpdated: formatBlogUpdatedAt(),
              }
            : item,
        ),
      );

      setFlash({
        title: "Post updated",
        detail: `${values.title} was saved to the local editorial board.`,
        tone: "blue",
      });
    } else {
      setItems((currentItems) => [
        {
          id: createBlogId(values.slug),
          values,
          lastUpdated: formatBlogUpdatedAt(),
        },
        ...currentItems,
      ]);

      setFlash({
        title: "Post created",
        detail: `${values.title} was added to the article workspace.`,
        tone: "red",
      });
    }

    setEditorState(null);
  }

  async function handleConfirmDelete() {
    if (!postPendingDelete) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 450));

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== postPendingDelete.id),
    );
    setFlash({
      title: "Post removed",
      detail: `${postPendingDelete.values.title} was removed from the local editorial board.`,
      tone: "cream",
    });
    setPostPendingDelete(null);

    if (editorState?.mode === "edit" && editorState.postId === postPendingDelete.id) {
      setEditorState(null);
    }
  }

  function handleDuplicatePost(post: BlogRecord) {
    const duplicatedValues = createDuplicateValues(post);

    setItems((currentItems) => [
      {
        id: createBlogId(duplicatedValues.slug),
        values: duplicatedValues,
        lastUpdated: formatBlogUpdatedAt(),
      },
      ...currentItems,
    ]);
    setFlash({
      title: "Post duplicated",
      detail: `${post.values.title} was copied into a new draft story.`,
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

      <BlogList
        items={items}
        isLoading={isLoading}
        onAddPost={() => setEditorState({ mode: "create" })}
        onEditPost={(post) => setEditorState({ mode: "edit", postId: post.id })}
        onDeletePost={(post) => setPostPendingDelete(post)}
        onDuplicatePost={handleDuplicatePost}
      />

      <BlogEditorPanel
        open={Boolean(editorState)}
        mode={editorState?.mode ?? "create"}
        defaultValues={editorDefaultValues}
        onOpenChange={(open) => {
          if (!open) {
            setEditorState(null);
          }
        }}
        onCancel={() => setEditorState(null)}
        onDelete={editingPost ? () => setPostPendingDelete(editingPost) : undefined}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(postPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPostPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <Badge variant="red">Delete Confirmation</Badge>
            <DialogTitle>Remove this post from the article workspace?</DialogTitle>
            <DialogDescription>
              {postPendingDelete
                ? `${postPendingDelete.values.title} will disappear from the local editorial board. This is UI-only and not persisted anywhere.`
                : "Confirm removal of the selected post entry."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="muted" onClick={() => setPostPendingDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="ink" onClick={handleConfirmDelete}>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
