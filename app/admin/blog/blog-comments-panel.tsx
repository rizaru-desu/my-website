"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminBlogCommentRecord } from "@/lib/blog-discussions.shared";
import {
  formatBlogCommentDate,
  getBlogCommentStatusLabel,
} from "@/lib/blog-discussions.shared";
import type { BlogPermissionSet, AdminBlogRecord } from "@/lib/blog.shared";

import {
  adminBlogCommentsQueryKey,
  adminBlogQueryKey,
  deleteAdminBlogCommentRequest,
  fetchAdminBlogComments,
  moderateAdminBlogCommentRequest,
} from "./blog.queries";

type BlogCommentsPanelProps = {
  open: boolean;
  permissions: BlogPermissionSet;
  post: AdminBlogRecord | null;
  onOpenChange: (open: boolean) => void;
};

type CommentTabValue = "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "SPAM";
type CommentSortValue = "newest" | "oldest";

function getStatusBadgeVariant(status: CommentTabValue | AdminBlogCommentRecord["status"]) {
  if (status === "APPROVED") {
    return "blue";
  }

  if (status === "PENDING") {
    return "yellow";
  }

  if (status === "REJECTED") {
    return "red";
  }

  return "cream";
}

function CommentCard({
  canDelete,
  canModerate,
  comment,
  isDeleting,
  isModerating,
  onDelete,
  onModerate,
}: {
  canDelete: boolean;
  canModerate: boolean;
  comment: AdminBlogCommentRecord;
  isDeleting: boolean;
  isModerating: boolean;
  onDelete: (comment: AdminBlogCommentRecord) => void;
  onModerate: (
    comment: AdminBlogCommentRecord,
    action: "approve" | "reject" | "spam",
  ) => void;
}) {
  return (
    <Card
      accent={comment.status === "APPROVED" ? "blue" : comment.status === "PENDING" ? "cream" : "red"}
      className="space-y-4"
    >
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(comment.status)}>
                {getBlogCommentStatusLabel(comment.status)}
              </Badge>
              <Badge variant="cream">
                {comment.depth === 0 ? "Top-level" : "Reply"}
              </Badge>
            </div>
            <CardTitle>{comment.displayName}</CardTitle>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
              Private email: {comment.email}
            </p>
            {comment.parentDisplayName ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
                Replying to {comment.parentDisplayName}
              </p>
            ) : null}
          </div>
          <div className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-ink/52">
            <p>Submitted {formatBlogCommentDate(comment.createdAt)}</p>
            {comment.reviewedAt ? (
              <p className="mt-2">
                Reviewed {formatBlogCommentDate(comment.reviewedAt)}
                {comment.reviewedByUserName ? ` by ${comment.reviewedByUserName}` : ""}
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-7 text-ink/78">{comment.body}</p>

        {canModerate || canDelete ? (
          <div className="flex flex-wrap gap-3">
            {canModerate && comment.status !== "APPROVED" ? (
              <Button
                type="button"
                variant="blue"
                disabled={isModerating || isDeleting}
                onClick={() => onModerate(comment, "approve")}
              >
                Approve
              </Button>
            ) : null}
            {canModerate && comment.status !== "REJECTED" ? (
              <Button
                type="button"
                variant="default"
                disabled={isModerating || isDeleting}
                onClick={() => onModerate(comment, "reject")}
              >
                Reject
              </Button>
            ) : null}
            {canModerate && comment.status !== "SPAM" ? (
              <Button
                type="button"
                variant="muted"
                disabled={isModerating || isDeleting}
                onClick={() => onModerate(comment, "spam")}
              >
                Mark Spam
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                type="button"
                variant="ink"
                disabled={isModerating || isDeleting}
                onClick={() => onDelete(comment)}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function BlogCommentsPanel({
  open,
  permissions,
  post,
  onOpenChange,
}: BlogCommentsPanelProps) {
  const queryClient = useQueryClient();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CommentTabValue>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<CommentSortValue>("newest");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const {
    data: comments = [],
    error,
    isFetching,
    isPending,
  } = useQuery({
    enabled: open && Boolean(post?.id),
    queryFn: async () => fetchAdminBlogComments(post?.id ?? ""),
    queryKey: adminBlogCommentsQueryKey(post?.id ?? ""),
    refetchOnWindowFocus: false,
  });

  const moderateMutation = useMutation({
    mutationFn: moderateAdminBlogCommentRequest,
    onMutate: () => {
      setFeedbackMessage(null);
    },
    onSuccess: async (result) => {
      setFeedbackMessage(result.message);
      if (!post) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminBlogCommentsQueryKey(post.id) }),
        queryClient.invalidateQueries({ queryKey: adminBlogQueryKey }),
      ]);
    },
    onError: (mutationError) => {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : "The comment moderation action could not be completed.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminBlogCommentRequest,
    onMutate: () => {
      setFeedbackMessage(null);
    },
    onSuccess: async (result) => {
      setFeedbackMessage(result.message);
      if (!post) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminBlogCommentsQueryKey(post.id) }),
        queryClient.invalidateQueries({ queryKey: adminBlogQueryKey }),
      ]);
    },
    onError: (mutationError) => {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : "The comment could not be deleted right now.",
      );
    },
  });

  const counts = useMemo(
    () => ({
      ALL: comments.length,
      APPROVED: comments.filter((comment) => comment.status === "APPROVED").length,
      PENDING: comments.filter((comment) => comment.status === "PENDING").length,
      REJECTED: comments.filter((comment) => comment.status === "REJECTED").length,
      SPAM: comments.filter((comment) => comment.status === "SPAM").length,
    }),
    [comments],
  );

  const filteredItems = useMemo(() => {
    const laneItems =
      activeTab === "ALL"
        ? comments
        : comments.filter((comment) => comment.status === activeTab);

    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    const searchedItems = normalizedQuery
      ? laneItems.filter((comment) =>
          [
            comment.displayName,
            comment.email,
            comment.body,
            comment.parentDisplayName ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : laneItems;

    return [...searchedItems].sort((first, second) => {
      const firstTime = new Date(first.createdAt).getTime();
      const secondTime = new Date(second.createdAt).getTime();

      return sortOrder === "oldest" ? firstTime - secondTime : secondTime - firstTime;
    });
  }, [activeTab, comments, deferredSearchQuery, sortOrder]);

  const hasActiveFilters = searchQuery.trim().length > 0 || sortOrder !== "newest";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">Discussion Queue</Badge>
            {post ? <Badge variant="cream">{post.values.title}</Badge> : null}
            {!permissions.canModerateComments ? (
              <Badge variant="yellow">Read Only</Badge>
            ) : null}
          </div>
          <DialogTitle>Review comment activity for this article.</DialogTitle>
          <DialogDescription>
            Guest comments and replies enter the moderation queue before they appear
            on the public blog.
          </DialogDescription>
        </DialogHeader>

        {feedbackMessage ? (
          <Card accent="cream" className="bg-white/75">
            <CardContent className="space-y-2">
              <Badge variant="yellow">Moderator Feedback</Badge>
              <CardDescription>{feedbackMessage}</CardDescription>
            </CardContent>
          </Card>
        ) : null}

        <Tabs defaultValue="PENDING" className="space-y-6">
          <TabsList>
            {(["PENDING", "APPROVED", "REJECTED", "SPAM", "ALL"] as const).map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                onClick={() => setActiveTab(value)}
              >
                {value.toLowerCase()} ({counts[value]})
              </TabsTrigger>
            ))}
          </TabsList>

          <Card className="bg-white/75">
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Badge variant="cream">Queue Controls</Badge>
                  <CardDescription>
                    Search guest identity or comment text, then adjust sort order inside
                    the active moderation lane.
                  </CardDescription>
                </div>
                <Badge variant="blue">
                  {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <label
                    htmlFor="blog-comment-search"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/58"
                  >
                    Search comments
                  </label>
                  <Input
                    id="blog-comment-search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search name, private email, reply target, or comment text"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={sortOrder === "newest" ? "blue" : "outline"}
                      onClick={() => setSortOrder("newest")}
                    >
                      Newest First
                    </Button>
                    <Button
                      type="button"
                      variant={sortOrder === "oldest" ? "blue" : "outline"}
                      onClick={() => setSortOrder("oldest")}
                    >
                      Oldest First
                    </Button>
                  </div>

                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="muted"
                      onClick={() => {
                        setSearchQuery("");
                        setSortOrder("newest");
                      }}
                    >
                      Reset Controls
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {(["PENDING", "APPROVED", "REJECTED", "SPAM", "ALL"] as const).map((value) => (
            <TabsContent key={value} value={value}>
              {isPending || isFetching ? (
                <Card className="bg-white/75">
                  <CardContent className="space-y-2">
                    <Badge variant="cream">Loading</Badge>
                    <CardTitle>Pulling the latest discussion queue.</CardTitle>
                    <CardDescription>
                      Moderation state, guest identity, and reply context are loading.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card accent="red">
                  <CardContent className="space-y-2">
                    <Badge variant="red">Queue Unavailable</Badge>
                    <CardTitle>The discussion queue could not be loaded.</CardTitle>
                    <CardDescription>
                      {error instanceof Error
                        ? error.message
                        : "The discussion queue could not be loaded right now."}
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : filteredItems.length === 0 ? (
                <Card accent="cream" className="bg-white/75">
                  <CardContent className="space-y-2">
                    <Badge variant={getStatusBadgeVariant(value)}>No Records</Badge>
                    <CardTitle>No comments in this moderation lane.</CardTitle>
                    <CardDescription>
                      {searchQuery.trim().length > 0
                        ? "No comments match the current search inside this moderation lane."
                        : "Comments matching this status will appear here for the selected article."}
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
                  {filteredItems.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      canDelete={permissions.canDeleteComments}
                      canModerate={permissions.canModerateComments}
                      comment={comment}
                      isDeleting={
                        deleteMutation.isPending && deleteMutation.variables === comment.id
                      }
                      isModerating={
                        moderateMutation.isPending && moderateMutation.variables?.id === comment.id
                      }
                      onDelete={(activeComment) => {
                        void deleteMutation.mutateAsync(activeComment.id);
                      }}
                      onModerate={(activeComment, action) => {
                        void moderateMutation.mutateAsync({
                          action,
                          id: activeComment.id,
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="muted" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
