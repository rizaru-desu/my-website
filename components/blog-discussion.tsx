"use client";

import { useTransition, useState } from "react";
import { useForm } from "@tanstack/react-form";

import { submitBlogCommentAction } from "@/app/actions/blog-comment.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/ui/editorial-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formatBlogCommentDate,
  type PublicBlogCommentInput,
  type PublicBlogCommentRecord,
} from "@/lib/blog-discussions.shared";
import {
  blogCommentSchema,
  type BlogCommentFormValues,
} from "@/lib/validations/blog-comment.schema";

type SubmissionState =
  | { tone: "idle"; message: string }
  | { tone: "success"; message: string }
  | { tone: "error"; message: string };

const idleSubmissionMessage =
  "Comments and replies are reviewed before they appear publicly.";
const INITIAL_VISIBLE_COMMENTS = 4;
const LOAD_MORE_STEP = 4;

function getErrorMessage(errors: unknown[] | undefined) {
  if (!errors?.length) {
    return null;
  }

  const firstError = errors[0];

  if (typeof firstError === "string") {
    return firstError;
  }

  if (
    typeof firstError === "object" &&
    firstError !== null &&
    "message" in firstError &&
    typeof firstError.message === "string"
  ) {
    return firstError.message;
  }

  return "Please check this field.";
}

function FieldError({
  errors,
  touched,
}: {
  errors: unknown[] | undefined;
  touched: boolean;
}) {
  const message = getErrorMessage(errors);

  if (!touched || !message) {
    return null;
  }

  return <p className="text-sm font-semibold leading-6 text-accent-red">{message}</p>;
}

function DiscussionCommentForm({
  blogSlug,
  onSubmitted,
  parentId,
  title,
}: {
  blogSlug: string;
  onSubmitted?: () => void;
  parentId?: string;
  title: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    tone: "idle",
    message: idleSubmissionMessage,
  });
  const defaultValues = {
    _honeypot: "",
    blogSlug,
    body: "",
    displayName: "",
    email: "",
    ...(parentId ? { parentId } : {}),
  } satisfies BlogCommentFormValues;

  const form = useForm({
    defaultValues,
    validators: {
      onChange: blogCommentSchema,
      onSubmit: blogCommentSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setSubmissionState({
        tone: "idle",
        message: parentId
          ? "Sending your reply into the moderation queue..."
          : "Sending your comment into the moderation queue...",
      });

      const result = await submitBlogCommentAction(value as PublicBlogCommentInput);

      setIsSubmitting(false);

      if (!result.ok) {
        setSubmissionState({
          tone: "error",
          message: result.message,
        });
        return;
      }

      form.reset();
      setSubmissionState({
        tone: "success",
        message: result.message,
      });
      onSubmitted?.();
    },
  });

  return (
    <div className="space-y-4 rounded-[24px] border-[3px] border-ink bg-white/70 p-4 shadow-[6px_6px_0_var(--ink)]">
      <div className="space-y-2">
        <Badge variant="blue">{title}</Badge>
        <p
          className={`rounded-[20px] border-[3px] px-4 py-3 text-sm font-semibold leading-6 shadow-[4px_4px_0_var(--ink)] ${
            submissionState.tone === "error"
              ? "border-accent-red bg-white text-accent-red"
              : submissionState.tone === "success"
                ? "border-accent-blue bg-white text-accent-blue"
                : "border-ink bg-white/70 text-ink/72"
          }`}
        >
          {submissionState.message}
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="displayName">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Name
                </label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Your name"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Email
                </label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="name@example.com"
                />
                <p className="text-xs leading-6 text-ink/55">
                  Stored privately for moderation only. It never appears publicly.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="body">
          {(field) => (
            <div className="space-y-2">
              <label
                htmlFor={field.name}
                className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
              >
                {parentId ? "Reply" : "Comment"}
              </label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={
                  parentId
                    ? "Add a thoughtful reply that moves the discussion forward."
                    : "Share a thoughtful comment about the article."
                }
                className="min-h-32"
              />
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="_honeypot">
          {(field) => (
            <div className="hidden" aria-hidden="true">
              <label htmlFor={field.name}>Website</label>
              <input
                id={field.name}
                tabIndex={-1}
                autoComplete="off"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : parentId ? "Send Reply" : "Send Comment"}
        </Button>
      </form>
    </div>
  );
}

function CommentThreadItem({
  blogSlug,
  comment,
}: {
  blogSlug: string;
  comment: PublicBlogCommentRecord;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="space-y-4 rounded-[24px] border-[3px] border-ink bg-white/70 p-5 shadow-[6px_6px_0_var(--ink)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="font-display text-2xl uppercase leading-none text-ink">
            {comment.displayName}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            {formatBlogCommentDate(comment.createdAt)}
          </p>
        </div>
        <Button
          type="button"
          variant={showReplyForm ? "blue" : "outline"}
          onClick={() => setShowReplyForm((current) => !current)}
        >
          {showReplyForm ? "Hide Reply" : "Reply"}
        </Button>
      </div>

      <p className="text-sm leading-7 text-ink/78">{comment.body}</p>

      {comment.replies.length > 0 ? (
        <div className="space-y-4 border-l-[3px] border-dashed border-ink/25 pl-4">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="space-y-3 rounded-[20px] border-[3px] border-ink/15 bg-panel/85 p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">
                  {reply.displayName}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
                  {formatBlogCommentDate(reply.createdAt)}
                </p>
              </div>
              <p className="text-sm leading-7 text-ink/75">{reply.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {showReplyForm ? (
        <DiscussionCommentForm
          blogSlug={blogSlug}
          parentId={comment.id}
          title="Reply in moderation"
          onSubmitted={() => setShowReplyForm(false)}
        />
      ) : null}
    </div>
  );
}

export function BlogDiscussionSummary({ totalCount }: { totalCount: number }) {
  return (
    <EditorialCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant="red">Approved Thread</Badge>
        <Badge variant="cream">
          {totalCount} approved comment{totalCount === 1 ? "" : "s"}
        </Badge>
      </div>
      <p className="text-sm leading-7 text-ink/76">
        Top-level comments are shown newest first. Replies stay nested one level deep
        to keep the discussion easy to scan.
      </p>
    </EditorialCard>
  );
}

export function BlogDiscussion({
  blogSlug,
  comments,
}: {
  blogSlug: string;
  comments: PublicBlogCommentRecord[];
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COMMENTS);
  const [isPending, startTransition] = useTransition();
  const visibleComments = comments.slice(0, visibleCount);
  const hasHiddenComments = comments.length > visibleComments.length;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="blue">Discussion</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Continue the conversation under the article.
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-ink/76">
          Every new comment and reply goes through moderation first, so the thread
          stays readable and low-noise.
        </p>
      </div>

      <EditorialCard accent="blue" className="space-y-5">
        <div className="space-y-2">
          <Badge variant="cream">Leave a Comment</Badge>
          <p className="text-sm leading-7 text-ink/76">
            Guest comments are welcome. Use your real name and a private email so
            moderation can keep the thread credible.
          </p>
        </div>
        <DiscussionCommentForm blogSlug={blogSlug} title="New comment" />
      </EditorialCard>

      <div className="space-y-5">
        {comments.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="cream">
                Showing {visibleComments.length} of {comments.length} threads
              </Badge>
              {hasHiddenComments ? (
                <p className="text-sm leading-7 text-ink/62">
                  Older approved threads stay collapsed until you ask to see more.
                </p>
              ) : null}
            </div>

            {visibleComments.map((comment) => (
              <CommentThreadItem key={comment.id} blogSlug={blogSlug} comment={comment} />
            ))}

            {hasHiddenComments ? (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      setVisibleCount((current) =>
                        Math.min(current + LOAD_MORE_STEP, comments.length),
                      );
                    });
                  }}
                >
                  {isPending
                    ? "Loading more..."
                    : `Show ${Math.min(LOAD_MORE_STEP, comments.length - visibleComments.length)} more`}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <EditorialCard accent="cream" className="space-y-3">
            <Badge variant="yellow">No Comments Yet</Badge>
            <p className="text-sm leading-7 text-ink/75">
              This article has not received any approved discussion yet. A thoughtful
              first comment can set the tone.
            </p>
          </EditorialCard>
        )}
      </div>
    </div>
  );
}
