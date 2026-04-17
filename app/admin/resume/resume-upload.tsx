"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  type AdminResumeAssetRecord,
  formatResumeFileSize,
  formatResumeUpdatedAt,
} from "@/lib/resume.shared";

import {
  adminResumeAssetQueryKey,
  clearAdminResumeAssetRequest,
  fetchAdminResumeAsset,
  updateAdminResumeAssetRequest,
} from "./resume.queries";

type DraftState = {
  downloadUrl: string;
  fileName: string;
};

function createDraft(asset?: AdminResumeAssetRecord | null): DraftState {
  return {
    downloadUrl: asset?.downloadUrl ?? "",
    fileName: asset?.fileName ?? "",
  };
}

function getSourceBadge(asset: AdminResumeAssetRecord | undefined) {
  if (!asset || asset.source === "none") {
    return {
      label: "No Active Asset",
      variant: "red" as const,
    };
  }

  if (asset.source === "env") {
    return {
      label: "Env Fallback",
      variant: "cream" as const,
    };
  }

  return {
    label: "Database Saved",
    variant: "blue" as const,
  };
}

function getStatusCopy(asset: AdminResumeAssetRecord | undefined) {
  if (!asset || asset.source === "none") {
    return {
      description:
        "No CV file is configured yet. Public downloads will stay unavailable until a URL is saved here or provided through the environment fallback.",
      title: "No tracked CV target yet",
    };
  }

  if (asset.source === "env") {
    return {
      description:
        "Public downloads currently use the environment fallback. Saving from this screen will override that fallback with a stored database record.",
      title: "Using environment fallback",
    };
  }

  return {
    description:
      "This stored record controls the public CV download route. Recruiters clicking Download CV will be redirected to this file while tracking stays on the server.",
    title: "Stored resume asset is live",
  };
}

function getHostLabel(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  try {
    return new URL(
      value.startsWith("/") ? `https://portfolio.local${value}` : value,
    ).host;
  } catch {
    return "Relative path";
  }
}

export function ResumeUpload() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftState>(createDraft());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: asset,
    error,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: adminResumeAssetQueryKey,
    queryFn: fetchAdminResumeAsset,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setDraft(createDraft(asset));
  }, [asset?.downloadUrl, asset?.fileName, asset?.source, asset?.updatedAt]);

  const saveMutation = useMutation({
    mutationFn: updateAdminResumeAssetRequest,
    onMutate: () => {
      setFeedback(null);
      setFormError(null);
    },
    onSuccess: async (result) => {
      setFeedback(result.message);
      await queryClient.invalidateQueries({ queryKey: adminResumeAssetQueryKey });
    },
    onError: (mutationError) => {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "The resume asset could not be saved right now.",
      );
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearAdminResumeAssetRequest,
    onMutate: () => {
      setFeedback(null);
      setFormError(null);
    },
    onSuccess: async (result) => {
      setFeedback(result.message);
      await queryClient.invalidateQueries({ queryKey: adminResumeAssetQueryKey });
    },
    onError: (mutationError) => {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "The resume asset could not be cleared right now.",
      );
    },
  });

  const sourceBadge = getSourceBadge(asset);
  const statusCopy = getStatusCopy(asset);
  const isBusy = saveMutation.isPending || clearMutation.isPending;
  const isDirty =
    draft.downloadUrl.trim() !== (asset?.downloadUrl ?? "") ||
    draft.fileName.trim() !== (asset?.fileName ?? "");
  const canClear = asset?.source === "database";
  const activeUrl = asset?.downloadUrl;

  const previewMeta = useMemo(
    () => ({
      host: getHostLabel(activeUrl ?? null),
      updatedAt: formatResumeUpdatedAt(asset?.updatedAt ?? null),
    }),
    [activeUrl, asset?.updatedAt],
  );

  function handleSave() {
    if (!draft.downloadUrl.trim()) {
      setFormError("Resume URL is required.");
      return;
    }

    saveMutation.mutate({
      downloadUrl: draft.downloadUrl.trim(),
      fileName: draft.fileName.trim() || undefined,
      mimeType: "application/pdf",
    });
  }

  function handleResetDraft() {
    setDraft(createDraft(asset));
    setFormError(null);
    setFeedback(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge variant={sourceBadge.variant}>{sourceBadge.label}</Badge>
            <CardTitle>Resume delivery manager</CardTitle>
            <CardDescription>
              Save the hosted PDF URL that should power public CV downloads. The
              download route and dashboard tracking both read from this source now.
            </CardDescription>
          </div>

          <Separator />

          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                Resume PDF URL
              </span>
              <Input
                type="url"
                placeholder="https://cdn.example.com/rizal-achmad-resume.pdf"
                value={draft.downloadUrl}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    downloadUrl: event.target.value,
                  }))
                }
                disabled={isBusy || isLoading}
              />
              <p className="text-sm leading-6 text-ink/62">
                Use an absolute `https://` URL or a site-relative path like
                `/resume/rizal-achmad.pdf`.
              </p>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                File name label
              </span>
              <Input
                type="text"
                placeholder="Rizal-Achmad-Resume.pdf"
                value={draft.fileName}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    fileName: event.target.value,
                  }))
                }
                disabled={isBusy || isLoading}
              />
              <p className="text-sm leading-6 text-ink/62">
                Optional. If left blank, the label is inferred from the saved URL.
              </p>
            </label>
          </div>

          {formError ? (
            <p className="text-sm font-semibold leading-6 text-accent-red">{formError}</p>
          ) : null}

          {feedback ? (
            <p className="text-sm font-semibold leading-6 text-ink/72">{feedback}</p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="blue"
              onClick={handleSave}
              disabled={isBusy || isLoading || !draft.downloadUrl.trim() || !isDirty}
            >
              {saveMutation.isPending ? "Saving asset..." : "Save Asset"}
            </Button>
            <Button
              type="button"
              variant="muted"
              onClick={handleResetDraft}
              disabled={isBusy || isLoading || !isDirty}
            >
              Reset Draft
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => clearMutation.mutate()}
              disabled={isBusy || isLoading || !canClear}
            >
              {clearMutation.isPending ? "Clearing..." : "Clear Stored Asset"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card accent="blue" className="space-y-4">
          <CardContent className="space-y-5">
            <Badge variant="blue">Current Source</Badge>

            {isLoading ? (
              <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 text-sm leading-7 text-ink/72 shadow-[6px_6px_0_var(--ink)]">
                Loading the current resume asset...
              </div>
            ) : error ? (
              <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 text-sm leading-7 text-accent-red shadow-[6px_6px_0_var(--ink)]">
                {error instanceof Error
                  ? error.message
                  : "The current resume asset could not be loaded."}
              </div>
            ) : (
              <>
                <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 shadow-[6px_6px_0_var(--ink)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-16 w-14 place-items-center rounded-[18px] border-[3px] border-ink bg-panel font-display text-2xl uppercase text-ink">
                      PDF
                    </div>
                    <Badge variant={sourceBadge.variant}>{sourceBadge.label}</Badge>
                  </div>
                  <div className="mt-5 space-y-3">
                    <p className="font-display text-2xl uppercase leading-none text-ink">
                      {asset?.fileName ?? "No file label yet"}
                    </p>
                    <p className="text-sm leading-7 text-ink/74 break-all">
                      {asset?.downloadUrl ?? "No active CV URL is configured yet."}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="min-w-0 rounded-[18px] border-[3px] border-ink bg-panel px-3 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
                          Host
                        </p>
                        <p className="mt-2 break-words text-[0.82rem] font-semibold uppercase leading-5 tracking-[0.05em] text-ink">
                          {previewMeta.host}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-[18px] border-[3px] border-ink bg-panel px-3 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
                          Saved
                        </p>
                        <p className="mt-2 break-words text-[0.82rem] font-semibold uppercase leading-5 tracking-[0.05em] text-ink">
                          {previewMeta.updatedAt}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-[18px] border-[3px] border-ink bg-panel px-3 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
                          Size
                        </p>
                        <p className="mt-2 break-words text-[0.82rem] font-semibold uppercase leading-5 tracking-[0.05em] text-ink">
                          {formatResumeFileSize(asset?.fileSizeBytes ?? null)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-display text-2xl uppercase leading-none text-ink">
                    {statusCopy.title}
                  </p>
                  <p className="text-sm leading-7 text-ink/76">{statusCopy.description}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {activeUrl ? (
                    <Button type="button" variant="muted" asChild>
                      <a href={activeUrl} target="_blank" rel="noreferrer">
                        Open File
                      </a>
                    </Button>
                  ) : (
                    <Button type="button" variant="muted" disabled>
                      Open File
                    </Button>
                  )}
                  <Button type="button" variant="default" asChild>
                    <a href="/api/cv/download" target="_blank" rel="noreferrer">
                      Test Public Download
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="space-y-4">
          <CardContent className="space-y-4">
            <Badge variant="cream">Delivery Notes</Badge>
            <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 shadow-[6px_6px_0_var(--ink)]">
              <div className="space-y-4 text-sm leading-7 text-ink/74">
                <p>
                  The public resume button now routes through the server first, so CV
                  downloads can be tracked in dashboard analytics instead of bypassing
                  the app completely.
                </p>
                <p>
                  This screen manages the file destination only. Full binary upload and
                  cloud storage are still separate work, so use a hosted PDF URL for now.
                </p>
                {isFetching ? (
                  <p className="font-semibold uppercase tracking-[0.16em] text-ink/60">
                    Refreshing resume asset...
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
