"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  formatMessageDate,
  getMessageStatusLabel,
  isMessageArchived,
  isMessageUnread,
  normalizeReplySubject,
  type MessageRecord,
  type MessageReplyInput,
} from "@/lib/messages.shared";

type MessageDetailPanelProps = {
  message: MessageRecord | null;
  isReplying: boolean;
  isUpdating: boolean;
  onArchiveToggle: (messageId: string) => void;
  onReplySend: (messageId: string, reply: MessageReplyInput) => Promise<void>;
  onToggleRead: (messageId: string) => void;
};

function getStatusBadge(message: MessageRecord) {
  if (isMessageArchived(message.status)) {
    return <Badge variant="cream">Archived</Badge>;
  }

  if (isMessageUnread(message.status)) {
    return <Badge variant="red">Unread</Badge>;
  }

  return <Badge variant="blue">Read</Badge>;
}

export function MessageDetailPanel({
  message,
  isReplying,
  isUpdating,
  onArchiveToggle,
  onReplySend,
  onToggleRead,
}: MessageDetailPanelProps) {
  const [replyBody, setReplyBody] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      setReplyBody("");
      setReplyFeedback(null);
      setReplySubject("");
      return;
    }

    setReplyBody("");
    setReplyFeedback(null);
    setReplySubject(normalizeReplySubject(message.subject));
  }, [message]);

  if (!message) {
    return (
      <Card accent="cream" className="h-full">
        <CardContent className="flex h-full min-h-[420px] flex-col items-center justify-center space-y-4 text-center">
          <Badge variant="cream">Inbox Detail</Badge>
          <CardTitle>Select a message to review the full conversation.</CardTitle>
          <CardDescription className="max-w-md">
            The detail panel keeps the reply surface, archive action, and read state
            controls in one clean editor-like space.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const isArchived = isMessageArchived(message.status);
  const isUnread = isMessageUnread(message.status);
  const activeMessageId = message.id;

  async function handleReplySend() {
    if (!replyBody.trim()) {
      setReplyFeedback("Write a fuller reply before sending it.");
      return;
    }

    try {
      await onReplySend(activeMessageId, {
        body: replyBody,
        subject: replySubject,
      });
      setReplyBody("");
      setReplyFeedback("Reply sent successfully.");
    } catch (error) {
      setReplyFeedback(
        error instanceof Error ? error.message : "The reply could not be sent right now.",
      );
    }
  }

  return (
    <Card accent="cream" className="h-full transition-all duration-200">
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(message)}
                <Badge variant="yellow">{getMessageStatusLabel(message.status)}</Badge>
              </div>
              <CardTitle>{message.subject}</CardTitle>
              <CardDescription>
                {message.senderName} · {message.senderEmail}
              </CardDescription>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
              {formatMessageDate(message.createdAt)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={isUnread ? "blue" : "muted"}
              disabled={isUpdating || isArchived}
              onClick={() => onToggleRead(message.id)}
            >
              Mark as {isUnread ? "Read" : "Unread"}
            </Button>
            <Button
              type="button"
              variant={isArchived ? "outline" : "default"}
              disabled={isUpdating || isReplying}
              onClick={() => onArchiveToggle(message.id)}
            >
              {isArchived ? "Restore" : "Archive"}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="rounded-[26px] border-[3px] border-ink bg-white/80 px-5 py-5 shadow-[6px_6px_0_var(--ink)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/55">
            Message Body
          </p>
          <div className="mt-4 space-y-5 text-sm leading-7 text-ink/80">
            {message.body.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[26px] border-[3px] border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] px-5 py-5 shadow-[6px_6px_0_var(--ink)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/55">
              Reply Draft
            </p>
            <p className="text-sm leading-7 text-ink/75">
              Reply sending now uses the configured Gmail SMTP mailer, so this panel can
              send a direct response from the admin inbox.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                Subject
              </span>
              <Input
                disabled={isReplying}
                value={replySubject}
                onChange={(event) => {
                  setReplyFeedback(null);
                  setReplySubject(event.target.value);
                }}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                Reply
              </span>
              <Textarea
                disabled={isReplying}
                value={replyBody}
                onChange={(event) => {
                  setReplyFeedback(null);
                  setReplyBody(event.target.value);
                }}
                placeholder="Write a thoughtful follow-up response..."
                className="min-h-40"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={`text-sm leading-6 ${
                replyFeedback?.toLowerCase().includes("success")
                  ? "text-accent-blue"
                  : replyFeedback
                    ? "text-accent-red"
                    : "text-ink/68"
              }`}
            >
              {replyFeedback ??
                (isReplying
                  ? "Sending the reply through Gmail SMTP..."
                  : "The reply will be sent to the original sender email on this thread.")}
            </p>
            <Button
              type="button"
              variant="blue"
              disabled={isReplying || !replyBody.trim() || !replySubject.trim()}
              onClick={() => {
                void handleReplySend();
              }}
            >
              {isReplying ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
