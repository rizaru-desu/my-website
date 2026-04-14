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
import { authClient } from "@/lib/auth-client";
import {
  canManageBlogPost,
  type AdminBlogRecord,
  type BlogPermissionSet,
} from "@/lib/blog.shared";

import { createBlogDefaultValues } from "./blog.default-values";
import { BlogCommentsPanel } from "./blog-comments-panel";
import { BlogEditorPanel } from "./blog-editor-panel";
import { BlogList } from "./blog-list";
import {
  adminBlogQueryKey,
  createAdminBlogRequest,
  deleteAdminBlogRequest,
  duplicateAdminBlogRequest,
  fetchAdminBlogPosts,
  updateAdminBlogRequest,
} from "./blog.queries";
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

type BlogsCmsProps = {
  currentUserName: string;
  permissions: BlogPermissionSet;
};

function canEditPost(permissions: BlogPermissionSet, post: AdminBlogRecord) {
  if (!canManageBlogPost(permissions, post, "update")) {
    return false;
  }

  if (post.values.status === "published") {
    return canManageBlogPost(permissions, post, "publish");
  }

  if (post.values.status === "archived") {
    return permissions.canDelete;
  }

  return true;
}

function getAllowedStatuses(permissions: BlogPermissionSet) {
  if (permissions.canDelete) {
    return ["draft", "published", "archived"] as const;
  }

  if (permissions.canPublish) {
    return ["draft", "published"] as const;
  }

  return ["draft"] as const;
}

export function BlogsCms({ currentUserName, permissions }: BlogsCmsProps) {
  const queryClient = useQueryClient();
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<AdminBlogRecord | null>(null);
  const [postPendingDiscussion, setPostPendingDiscussion] = useState<AdminBlogRecord | null>(null);
  const [flash, setFlash] = useState<FlashState | null>(null);
  const {
    data: items = [],
    error,
    isFetching,
    isLoading,
  } = useQuery({
    queryFn: fetchAdminBlogPosts,
    queryKey: adminBlogQueryKey,
    refetchOnWindowFocus: false,
  });

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

  const clientPermissions = useMemo<BlogPermissionSet>(() => {
    if (!permissions.role) {
      return permissions;
    }

    const checkArticle = (
      action: "create" | "delete" | "draft" | "publish" | "read" | "update",
    ) =>
      authClient.admin.checkRolePermission({
        permissions: {
          article: [action],
        },
        role: permissions.role as "apprentice" | "architect" | "artisan" | "curator",
      });

    const checkComment = (action: "delete" | "moderate" | "read") =>
      authClient.admin.checkRolePermission({
        permissions: {
          comment: [action],
        },
        role: permissions.role as "apprentice" | "architect" | "artisan" | "curator",
      });

    return {
      ...permissions,
      canCreate: permissions.canCreate && checkArticle("create"),
      canDelete: permissions.canDelete && checkArticle("delete"),
      canDeleteComments: permissions.canDeleteComments && checkComment("delete"),
      canDraft: permissions.canDraft && checkArticle("draft"),
      canModerateComments:
        permissions.canModerateComments && checkComment("moderate"),
      canPublish: permissions.canPublish && checkArticle("publish"),
      canRead: permissions.canRead && checkArticle("read"),
      canReadComments: permissions.canReadComments && checkComment("read"),
      canUpdate: permissions.canUpdate && checkArticle("update"),
    };
  }, [permissions]);
  const editorDefaultValues = editingPost?.values ?? createBlogDefaultValues(currentUserName);
  const allowedStatuses = getAllowedStatuses(clientPermissions);
  const createMutation = useMutation({
    mutationFn: createAdminBlogRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Post created",
        tone: "red",
      });
      await queryClient.invalidateQueries({ queryKey: adminBlogQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The blog post could not be created right now.",
        title: "Create failed",
        tone: "red",
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateAdminBlogRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Post updated",
        tone: "blue",
      });
      await queryClient.invalidateQueries({ queryKey: adminBlogQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The blog post could not be updated right now.",
        title: "Update failed",
        tone: "red",
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminBlogRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Post removed",
        tone: "cream",
      });
      await queryClient.invalidateQueries({ queryKey: adminBlogQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The blog post could not be deleted right now.",
        title: "Delete failed",
        tone: "red",
      });
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: duplicateAdminBlogRequest,
    onSuccess: async (result) => {
      setFlash({
        detail: result.message,
        title: "Post duplicated",
        tone: "blue",
      });
      await queryClient.invalidateQueries({ queryKey: adminBlogQueryKey });
    },
    onError: (mutationError) => {
      setFlash({
        detail:
          mutationError instanceof Error
            ? mutationError.message
            : "The blog post could not be duplicated right now.",
        title: "Duplicate failed",
        tone: "red",
      });
    },
  });

  async function handleSubmit(values: BlogFormValues) {
    if (editorState?.mode === "edit" && editingPost) {
      await updateMutation.mutateAsync({
        id: editingPost.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    setEditorState(null);
  }

  async function handleConfirmDelete() {
    if (!postPendingDelete) {
      return;
    }

    await deleteMutation.mutateAsync(postPendingDelete.id);
    setPostPendingDelete(null);

    if (editorState?.mode === "edit" && editorState.postId === postPendingDelete.id) {
      setEditorState(null);
    }
  }

  async function handleDuplicatePost(post: AdminBlogRecord) {
    await duplicateMutation.mutateAsync(post.id);
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
            <Badge variant="red">Blog Unavailable</Badge>
            <CardTitle>The editorial database could not be loaded.</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "The blog board could not be loaded right now."}
            </CardDescription>
          </CardContent>
        </Card>
      ) : null}

      <BlogList
        items={items}
        isLoading={isLoading || isFetching}
        permissions={clientPermissions}
        onAddPost={() => {
          if (clientPermissions.canCreate) {
            setEditorState({ mode: "create" });
          }
        }}
        onEditPost={(post) => {
          if (canEditPost(clientPermissions, post)) {
            setEditorState({ mode: "edit", postId: post.id });
          }
        }}
        onDeletePost={(post) => {
          if (canManageBlogPost(clientPermissions, post, "delete")) {
            setPostPendingDelete(post);
          }
        }}
        onDuplicatePost={handleDuplicatePost}
        onOpenComments={(post) => {
          if (clientPermissions.canReadComments) {
            setPostPendingDiscussion(post);
          }
        }}
      />

      <BlogEditorPanel
        open={Boolean(editorState)}
        allowedStatuses={allowedStatuses}
        canDelete={
          editingPost ? canManageBlogPost(clientPermissions, editingPost, "delete") : false
        }
        mode={editorState?.mode ?? "create"}
        defaultValues={editorDefaultValues}
        onOpenChange={(open) => {
          if (!open) {
            setEditorState(null);
          }
        }}
        onCancel={() => setEditorState(null)}
        onDelete={
          editingPost && canManageBlogPost(clientPermissions, editingPost, "delete")
            ? () => setPostPendingDelete(editingPost)
            : undefined
        }
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
                ? `${postPendingDelete.values.title} will be removed from the persisted editorial database.`
                : "Confirm removal of the selected post entry."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="muted" onClick={() => setPostPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ink"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BlogCommentsPanel
        open={Boolean(postPendingDiscussion)}
        permissions={clientPermissions}
        post={postPendingDiscussion}
        onOpenChange={(open) => {
          if (!open) {
            setPostPendingDiscussion(null);
          }
        }}
      />
    </div>
  );
}
