"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "ready";

export function ProfilePhotoUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadTimeoutRef = useRef<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        window.clearTimeout(uploadTimeoutRef.current);
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const statusLabel = useMemo(() => {
    if (uploadState === "uploading") {
      return { label: "Uploading", variant: "blue" as const };
    }

    if (uploadState === "ready") {
      return { label: "Ready", variant: "cream" as const };
    }

    return { label: "Avatar Slot", variant: "red" as const };
  }, [uploadState]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearFileState() {
    if (uploadTimeoutRef.current) {
      window.clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setFileName(null);
    setUploadState("idle");
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function processFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Image files only. Drop or choose a JPG, PNG, WEBP, or SVG.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError(null);
    setPreviewUrl(null);
    setUploadState("uploading");
    setFileName(file.name);

    const nextPreviewUrl = URL.createObjectURL(file);

    if (uploadTimeoutRef.current) {
      window.clearTimeout(uploadTimeoutRef.current);
    }

    uploadTimeoutRef.current = window.setTimeout(() => {
      setPreviewUrl(nextPreviewUrl);
      setUploadState("ready");
      uploadTimeoutRef.current = null;
    }, 900);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    processFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <Card accent="red" className="space-y-4">
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Badge variant={statusLabel.variant}>{statusLabel.label}</Badge>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>
            Drag and drop an image to review the avatar slot before saving. The
            current flow keeps the file in this browser session.
          </CardDescription>
        </div>

        <button
          type="button"
          onClick={openFilePicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "group relative flex min-h-72 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px] border-[3px] border-dashed border-ink bg-white/70 px-6 py-8 text-center shadow-[6px_6px_0_var(--ink)] transition",
            isDragging && "bg-accent-blue/12",
            uploadState === "uploading" && "cursor-progress",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {previewUrl ? (
            <div className="space-y-4">
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-[3px] border-ink bg-panel shadow-[6px_6px_0_var(--ink)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Profile photo preview"
                  className={cn(
                    "h-full w-full object-cover",
                    uploadState === "uploading" && "opacity-60 grayscale",
                  )}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                  {fileName ?? "Selected image"}
                </p>
                <p className="text-sm leading-7 text-ink/72">
                  {uploadState === "uploading"
                    ? "Preparing the image..."
                    : "The avatar image is ready for review."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid h-36 w-36 place-items-center rounded-full border-[3px] border-ink bg-panel font-display text-5xl uppercase text-ink shadow-[6px_6px_0_var(--ink)]">
                RA
              </div>
              <div className="space-y-2">
                <p className="font-display text-3xl uppercase leading-none text-ink">
                  Drop image here
                </p>
                <p className="max-w-sm text-sm leading-7 text-ink/72">
                  Or click to choose a file. The uploader accepts image files only and
                  keeps everything in this browser session.
                </p>
              </div>
            </>
          )}
        </button>

        {error ? (
          <p className="text-sm font-semibold leading-6 text-accent-red">{error}</p>
        ) : null}

        <Separator />

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="blue"
            onClick={openFilePicker}
            disabled={uploadState === "uploading"}
          >
            {previewUrl ? "Replace Image" : "Choose Image"}
          </Button>
          <Button
            type="button"
            variant="muted"
            onClick={clearFileState}
            disabled={!previewUrl || uploadState === "uploading"}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
