"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  formatMessageDate,
  getMessagePreview,
  getMessageStatusLabel,
  isMessageArchived,
  isMessageUnread,
  type MessageFilter,
  type MessageStatusValue,
} from "@/lib/messages.shared";

import { MessageDetailPanel } from "./message-detail-panel";
import {
  adminMessagesQueryKey,
  fetchAdminMessages,
  sendAdminMessageReply,
  updateAdminMessageStatus,
} from "./messages.queries";

function previewMessageCount(
  items: Awaited<ReturnType<typeof fetchAdminMessages>>,
) {
  return {
    all: items.length,
    archived: items.filter((item) => isMessageArchived(item.status)).length,
    unread: items.filter((item) => isMessageUnread(item.status)).length,
  };
}

function matchesFilter(
  status: MessageStatusValue,
  filter: MessageFilter,
) {
  if (filter === "unread") {
    return isMessageUnread(status);
  }

  if (filter === "archived") {
    return isMessageArchived(status);
  }

  return true;
}

export function MessagesInbox() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const {
    data: messages = [],
    error,
    isPending,
    isRefetching,
  } = useQuery({
    queryKey: adminMessagesQueryKey,
    queryFn: fetchAdminMessages,
  });

  const counts = useMemo(() => previewMessageCount(messages), [messages]);

  const filteredMessages = useMemo(() => {
    if (filter === "unread") {
      return messages.filter((message) => isMessageUnread(message.status));
    }

    if (filter === "archived") {
      return messages.filter((message) => isMessageArchived(message.status));
    }

    return messages;
  }, [filter, messages]);

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedMessageId) ?? null;

  const statusMutation = useMutation({
    mutationFn: updateAdminMessageStatus,
    onMutate: (input) => {
      setFeedbackMessage(null);

      if (selectedMessageId !== input.id) {
        return;
      }

      if (!matchesFilter(input.status, filter)) {
        setSelectedMessageId(null);
      }
    },
    onSuccess: async (result) => {
      setFeedbackMessage(result.message);
      await queryClient.invalidateQueries({ queryKey: adminMessagesQueryKey });
    },
    onError: (mutationError) => {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : "The message status could not be updated.",
      );
    },
  });

  const replyMutation = useMutation({
    mutationFn: sendAdminMessageReply,
    onMutate: () => {
      setFeedbackMessage(null);
    },
    onSuccess: async (result, variables) => {
      if (filter === "unread" && selectedMessageId === variables.id) {
        setSelectedMessageId(null);
      }

      setFeedbackMessage(result.message);
      await queryClient.invalidateQueries({ queryKey: adminMessagesQueryKey });
    },
    onError: (mutationError) => {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : "The reply could not be sent right now.",
      );
    },
  });

  function runMessageAction(messageId: string, nextStatus: MessageStatusValue) {
    statusMutation.mutate({
      id: messageId,
      status: nextStatus,
    });
  }

  function handleSelectMessage(messageId: string) {
    const message = messages.find((item) => item.id === messageId);

    setSelectedMessageId(messageId);

    if (message && isMessageUnread(message.status)) {
      runMessageAction(messageId, "READ");
    }
  }

  function handleFilterChange(nextFilter: MessageFilter) {
    setFilter(nextFilter);

    if (selectedMessageId === null) {
      return;
    }

    const selectedItem = messages.find((message) => message.id === selectedMessageId);

    if (!selectedItem || !matchesFilter(selectedItem.status, nextFilter)) {
      setSelectedMessageId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.85fr)]">
      <Card className="overflow-hidden">
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Badge variant="cream">Inbox Filters</Badge>
              <CardTitle>Messages from recruiters and collaborators.</CardTitle>
              <CardDescription>
                Keep the message list structured, readable, and fast to scan.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={filter === "all" ? "blue" : "muted"}
                onClick={() => handleFilterChange("all")}
              >
                All {counts.all}
              </Button>
              <Button
                type="button"
                variant={filter === "unread" ? "blue" : "muted"}
                onClick={() => handleFilterChange("unread")}
              >
                Unread {counts.unread}
              </Button>
              <Button
                type="button"
                variant={filter === "archived" ? "blue" : "muted"}
                onClick={() => handleFilterChange("archived")}
              >
                Archived {counts.archived}
              </Button>
            </div>
          </div>

          {feedbackMessage ? (
            <div className="rounded-[22px] border-[3px] border-accent-red bg-white px-4 py-3 text-sm font-semibold leading-6 text-accent-red shadow-[5px_5px_0_var(--ink)]">
              {feedbackMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[22px] border-[3px] border-accent-red bg-white px-4 py-3 text-sm font-semibold leading-6 text-accent-red shadow-[5px_5px_0_var(--ink)]">
              {error instanceof Error
                ? error.message
                : "The inbox could not be loaded right now."}
            </div>
          ) : null}

          <div className="space-y-3">
            {isPending ? (
              <Card accent="cream" className="bg-white/70">
                <CardContent className="space-y-4 text-center">
                  <Badge variant="yellow">Loading</Badge>
                  <CardTitle>Loading inbox activity.</CardTitle>
                  <CardDescription>
                    Pulling the latest message list from the server.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : filteredMessages.length === 0 ? (
              <Card accent="cream" className="bg-white/70">
                <CardContent className="space-y-4 text-center">
                  <Badge variant="yellow">Empty State</Badge>
                  <CardTitle>No messages in this view.</CardTitle>
                  <CardDescription>
                    Switch filters or wait for new inbox activity to appear here.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((message) => {
                const isSelected = message.id === selectedMessageId;
                const isArchived = isMessageArchived(message.status);
                const isUnread = isMessageUnread(message.status);
                const isRunning =
                  statusMutation.isPending && statusMutation.variables?.id === message.id;

                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => handleSelectMessage(message.id)}
                    disabled={isRunning}
                    className={`w-full rounded-[26px] border-[3px] px-5 py-5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] shadow-[6px_6px_0_var(--ink)]"
                        : isUnread
                          ? "border-ink bg-[#fff4bd] shadow-[5px_5px_0_var(--ink)] hover:bg-[#ffef9f]"
                          : isArchived
                            ? "border-ink bg-panel shadow-[4px_4px_0_var(--ink)] hover:bg-[#f5e6a0]"
                            : "border-ink bg-white/80 shadow-[4px_4px_0_var(--ink)] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {isUnread ? (
                            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-ink bg-accent-red" />
                          ) : null}
                          <p className="truncate text-sm font-semibold uppercase tracking-[0.16em] text-ink/62">
                            {message.senderName}
                          </p>
                        </div>
                        <h3 className="truncate font-display text-2xl uppercase leading-none text-ink">
                          {message.subject}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-7 text-ink/76">
                          {getMessagePreview(message.body)}
                        </p>
                      </div>
                      <div className="shrink-0 space-y-2 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                          {formatMessageDate(message.createdAt)}
                        </p>
                        <div className="flex justify-end gap-2">
                          <Badge variant={isUnread ? "red" : isArchived ? "cream" : "blue"}>
                            {isRunning ? "Updating" : getMessageStatusLabel(message.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {isRefetching && !isPending ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/52">
              Refreshing inbox...
            </p>
          ) : null}
        </CardContent>
      </Card>

      <MessageDetailPanel
        key={selectedMessage?.id ?? "empty-message-detail"}
        isReplying={replyMutation.isPending}
        isUpdating={statusMutation.isPending}
        message={selectedMessage}
        onArchiveToggle={(messageId) => {
          const nextStatus = isMessageArchived(
            messages.find((message) => message.id === messageId)?.status ?? "READ",
          )
            ? "READ"
            : "ARCHIVED";

          runMessageAction(messageId, nextStatus);
        }}
        onReplySend={async (messageId, reply) => {
          await replyMutation.mutateAsync({
            id: messageId,
            reply,
          });
        }}
        onToggleRead={(messageId) => {
          const nextStatus = isMessageUnread(
            messages.find((message) => message.id === messageId)?.status ?? "READ",
          )
            ? "READ"
            : "UNREAD";

          runMessageAction(messageId, nextStatus);
        }}
      />
    </div>
  );
}
