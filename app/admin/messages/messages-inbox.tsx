"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

import { MessageDetailPanel } from "./message-detail-panel";
import {
  messageSeedRecords,
  type MessageFilter,
} from "./messages.default-values";

function previewMessageCount(items: typeof messageSeedRecords) {
  return {
    all: items.length,
    unread: items.filter((item) => !item.read).length,
    archived: items.filter((item) => item.archived).length,
  };
}

export function MessagesInbox() {
  const [messages, setMessages] = useState(messageSeedRecords);
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    messageSeedRecords.find((message) => !message.archived)?.id ?? messageSeedRecords[0]?.id ?? null,
  );

  const counts = useMemo(() => previewMessageCount(messages), [messages]);

  const filteredMessages = useMemo(() => {
    if (filter === "unread") {
      return messages.filter((message) => !message.read);
    }

    if (filter === "archived") {
      return messages.filter((message) => message.archived);
    }

    return messages;
  }, [filter, messages]);

  const selectedMessage =
    messages.find((message) => message.id === selectedMessageId) ?? null;

  useEffect(() => {
    if (filteredMessages.length === 0) {
      setSelectedMessageId(null);
      return;
    }

    if (!filteredMessages.some((message) => message.id === selectedMessageId)) {
      setSelectedMessageId(filteredMessages[0].id);
    }
  }, [filteredMessages, selectedMessageId]);

  function updateMessage(messageId: string, nextValues: Partial<(typeof messageSeedRecords)[number]>) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              ...nextValues,
            }
          : message,
      ),
    );
  }

  function handleSelectMessage(messageId: string) {
    setSelectedMessageId(messageId);
    updateMessage(messageId, { read: true });
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
                onClick={() => setFilter("all")}
              >
                All {counts.all}
              </Button>
              <Button
                type="button"
                variant={filter === "unread" ? "blue" : "muted"}
                onClick={() => setFilter("unread")}
              >
                Unread {counts.unread}
              </Button>
              <Button
                type="button"
                variant={filter === "archived" ? "blue" : "muted"}
                onClick={() => setFilter("archived")}
              >
                Archived {counts.archived}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
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

                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => handleSelectMessage(message.id)}
                    className={`w-full rounded-[26px] border-[3px] px-5 py-5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] shadow-[6px_6px_0_var(--ink)]"
                        : !message.read
                          ? "border-ink bg-[#fff4bd] shadow-[5px_5px_0_var(--ink)] hover:bg-[#ffef9f]"
                          : "border-ink bg-white/80 shadow-[4px_4px_0_var(--ink)] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {!message.read ? (
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
                          {message.preview}
                        </p>
                      </div>
                      <div className="shrink-0 space-y-2 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                          {message.date}
                        </p>
                        <div className="flex justify-end gap-2">
                          {message.archived ? <Badge variant="cream">Archived</Badge> : null}
                          {!message.read ? <Badge variant="red">Unread</Badge> : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <MessageDetailPanel
        message={selectedMessage}
        onArchiveToggle={(messageId) =>
          updateMessage(messageId, {
            archived: !messages.find((message) => message.id === messageId)?.archived,
          })
        }
        onToggleRead={(messageId) =>
          updateMessage(messageId, {
            read: !messages.find((message) => message.id === messageId)?.read,
          })
        }
      />
    </div>
  );
}
