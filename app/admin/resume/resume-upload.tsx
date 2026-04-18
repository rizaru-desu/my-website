"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type AdminResumeAssetRecord,
  formatResumeFileSize,
  formatResumeUpdatedAt,
  MAX_RESUME_FILE_BYTES,
  RESUME_STORAGE_FILE_NAME,
} from "@/lib/resume.shared";
import { cn } from "@/lib/utils";

import {
  adminResumeAssetQueryKey,
  clearAdminResumeAssetRequest,
  fetchAdminResumeAsset,
  uploadAdminResumeAssetRequest,
} from "./resume.queries";

type UploadState = "idle" | "ready" | "uploading";

function isPdfFile(file: File) {
  const normalizedType = file.type.trim().toLowerCase();
  const normalizedName = file.name.trim().toLowerCase();

  return normalizedType === "application/pdf" || normalizedName.endsWith(".pdf");
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
        "No CV file is configured yet. Upload a PDF here and the app will store it as `resume.pdf` in Cloudflare R2.",
      title: "No tracked CV target yet",
    };
  }

  if (asset.source === "env") {
    return {
      description:
        "Public downloads currently use the environment fallback. Uploading here will replace that fallback with the Cloudflare R2 copy managed by the admin screen.",
      title: "Using environment fallback",
    };
  }

  return {
    description:
      "This stored record controls the public CV download route. Recruiters clicking Download CV will be redirected to the latest `resume.pdf` while tracking stays on the server.",
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");

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

  const uploadMutation = useMutation({
    mutationFn: uploadAdminResumeAssetRequest,
    onMutate: () => {
      setFeedback(null);
      setFormError(null);
      setUploadState("uploading");
    },
    onSuccess: async (result) => {
      setFeedback(result.message);
      setSelectedFile(null);
      setUploadState("idle");
      await queryClient.invalidateQueries({ queryKey: adminResumeAssetQueryKey });
    },
    onError: (mutationError) => {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "The resume upload could not be completed right now.",
      );
      setUploadState(selectedFile ? "ready" : "idle");
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
  const isBusy = uploadMutation.isPending || clearMutation.isPending;
  const canClear = asset?.source === "database";
  const activeUrl = asset?.downloadUrl;

  const previewMeta = useMemo(
    () => ({
      host: getHostLabel(activeUrl ?? null),
      updatedAt: formatResumeUpdatedAt(asset?.updatedAt ?? null),
    }),
    [activeUrl, asset?.updatedAt],
  );

  function resetInputValue() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearPendingSelection() {
    setSelectedFile(null);
    setUploadState("idle");
    setFormError(null);
    resetInputValue();
  }

  function handleSelectedFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!isPdfFile(file)) {
      setFormError("PDF files only. Choose the latest resume in `.pdf` format.");
      setUploadState("idle");
      resetInputValue();
      return;
    }

    if (file.size === 0) {
      setFormError("The selected PDF is empty.");
      setUploadState("idle");
      resetInputValue();
      return;
    }

    if (file.size > MAX_RESUME_FILE_BYTES) {
      setFormError("Resume file size must stay under 50MB.");
      setUploadState("idle");
      resetInputValue();
      return;
    }

    setSelectedFile(file);
    setFeedback(null);
    setFormError(null);
    setUploadState("ready");
    resetInputValue();
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleSelectedFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleSelectedFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleUpload() {
    if (!selectedFile) {
      setFormError("Choose a PDF before uploading.");
      return;
    }

    uploadMutation.mutate(selectedFile);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge variant={sourceBadge.variant}>{sourceBadge.label}</Badge>
            <CardTitle>Resume delivery manager</CardTitle>
            <CardDescription>
              Upload one PDF and the server will publish it to Cloudflare R2 as{" "}
              <span className="font-semibold text-ink">{RESUME_STORAGE_FILE_NAME}</span>{" "}
              for the public CV download flow.
            </CardDescription>
          </div>

          <Separator />

          <button
            type="button"
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "group relative flex min-h-72 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px] border-[3px] border-dashed border-ink bg-white/70 px-6 py-8 text-center shadow-[6px_6px_0_var(--ink)] transition",
              isDragging && "bg-accent-blue/12",
              uploadState === "uploading" && "cursor-progress opacity-70",
            )}
            disabled={isBusy || isLoading}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleInputChange}
            />

            <div className="grid h-20 w-16 place-items-center rounded-[22px] border-[3px] border-ink bg-panel font-display text-3xl uppercase text-ink">
              PDF
            </div>

            {selectedFile ? (
              <div className="space-y-3">
                <p className="font-display text-3xl uppercase leading-none text-ink">
                  {RESUME_STORAGE_FILE_NAME}
                </p>
                <p className="max-w-lg text-sm leading-7 text-ink/74">
                  Source file: {selectedFile.name}
                  <br />
                  Size: {formatResumeFileSize(selectedFile.size)}
                </p>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/64">
                  {uploadState === "uploading"
                    ? "Uploading to Cloudflare R2..."
                    : "Ready to replace the current public resume"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-display text-3xl uppercase leading-none text-ink">
                  Drop resume PDF here
                </p>
                <p className="max-w-lg text-sm leading-7 text-ink/72">
                  Or click to choose a file. Only PDF uploads are accepted, and every
                  upload is stored as{" "}
                  <span className="font-semibold text-ink">
                    {RESUME_STORAGE_FILE_NAME}
                  </span>{" "}
                  in the bucket.
                </p>
              </div>
            )}
          </button>

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
              onClick={handleUpload}
              disabled={isBusy || isLoading || !selectedFile}
            >
              {uploadMutation.isPending ? "Uploading Resume..." : "Upload Resume"}
            </Button>
            <Button
              type="button"
              variant="muted"
              onClick={openFilePicker}
              disabled={isBusy || isLoading}
            >
              {selectedFile ? "Replace PDF" : "Choose PDF"}
            </Button>
            <Button
              type="button"
              variant="muted"
              onClick={clearPendingSelection}
              disabled={isBusy || !selectedFile}
            >
              Clear Selection
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
                  This screen now uploads the PDF directly to Cloudflare R2 and keeps
                  the public file name fixed as{" "}
                  <span className="font-semibold text-ink">
                    {RESUME_STORAGE_FILE_NAME}
                  </span>
                  .
                </p>
                <p>
                  Configure the Cloudflare R2 account, bucket, and public URL env
                  values on the server before using this uploader.
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
