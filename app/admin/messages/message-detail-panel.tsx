"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import type { MessageRecord } from "./messages.default-values";

type MessageDetailPanelProps = {
  message: MessageRecord | null;
  onArchiveToggle: (messageId: string) => void;
  onToggleRead: (messageId: string) => void;
};

function getStatusBadge(message: MessageRecord) {
  if (message.archived) {
    return <Badge variant="cream">Archived</Badge>;
  }

  if (!message.read) {
    return <Badge variant="red">Unread</Badge>;
  }

  return <Badge variant="blue">Read</Badge>;
}

export function MessageDetailPanel({
  message,
  onArchiveToggle,
  onToggleRead,
}: MessageDetailPanelProps) {
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (!message) {
      setReplySubject("");
      setReplyBody("");
      setSendState("idle");
      setIsSending(false);
      return;
    }

    setReplySubject(`Re: ${message.subject}`);
    setReplyBody("");
    setSendState("idle");
    setIsSending(false);
  }, [message]);

  function handleMockSend() {
    if (!message || !replyBody.trim()) {
      return;
    }

    setIsSending(true);
    setSendState("idle");

    window.setTimeout(() => {
      setIsSending(false);
      setSendState("success");
      setReplyBody("");
    }, 700);
  }

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

  return (
    <Card accent="cream" className="h-full transition-all duration-200">
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(message)}
                <Badge variant="yellow">{message.company}</Badge>
              </div>
              <CardTitle>{message.subject}</CardTitle>
              <CardDescription>
                {message.senderName} · {message.senderEmail}
              </CardDescription>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
              {message.date}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={message.read ? "muted" : "blue"}
              onClick={() => onToggleRead(message.id)}
            >
              Mark as {message.read ? "Unread" : "Read"}
            </Button>
            <Button
              type="button"
              variant={message.archived ? "outline" : "default"}
              onClick={() => onArchiveToggle(message.id)}
            >
              {message.archived ? "Restore" : "Archive"}
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
              Use this composer to draft a response from the inbox.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                Subject
              </span>
              <Input
                value={replySubject}
                onChange={(event) => setReplySubject(event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                Reply
              </span>
              <Textarea
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Write a thoughtful follow-up response..."
                className="min-h-40"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6 text-ink/68">
              {sendState === "success"
                ? "Reply draft sent to this thread."
                : "This action updates the thread view here first."}
            </p>
            <Button
              type="button"
              variant="blue"
              disabled={isSending || !replyBody.trim()}
              onClick={handleMockSend}
            >
              {isSending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
