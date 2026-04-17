"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Separator } from "@/components/ui/separator";
import { MAX_PROFILE_PHOTO_FILE_BYTES } from "@/app/admin/profile/profile.schema";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "ready";

type ProfilePhotoUploadProps = {
  fullName: string;
  onChange: (value: string | null) => void;
  value: string | null;
};

export function ProfilePhotoUpload({
  fullName,
  onChange,
  value,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const hasPhoto = Boolean(value);

  const statusLabel = useMemo(() => {
    if (uploadState === "uploading") {
      return { label: "Uploading", variant: "blue" as const };
    }

    if (uploadState === "ready" || hasPhoto) {
      return { label: "Ready", variant: "cream" as const };
    }

    return { label: "Avatar Slot", variant: "red" as const };
  }, [hasPhoto, uploadState]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function resetInputValue() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function clearFileState() {
    onChange(null);
    setFileName(null);
    setUploadState("idle");
    setError(null);
    resetInputValue();
  }

  function processFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_FILE_BYTES) {
      setError("Keep the image under 1MB before upload.");
      resetInputValue();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Image files only. Drop or choose a JPG, PNG, WEBP, or SVG.");
      resetInputValue();
      return;
    }

    setError(null);
    setUploadState("uploading");
    setFileName(file.name);

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string" || !reader.result.startsWith("data:image/")) {
        setError("The selected file could not be prepared as an image.");
        setUploadState("idle");
        resetInputValue();
        return;
      }

      onChange(reader.result);
      setUploadState("ready");
      resetInputValue();
    });

    reader.addEventListener("error", () => {
      setError("The selected file could not be read.");
      setUploadState("idle");
      resetInputValue();
    });

    reader.readAsDataURL(file);
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
            Drag and drop an image, then save the profile to publish this avatar.
            Images must stay under 1MB.
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
          disabled={uploadState === "uploading"}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {hasPhoto ? (
            <div className="space-y-4">
              <ProfileAvatar
                name={fullName}
                src={value}
                className={cn(
                  "mx-auto h-36 w-36 rounded-full",
                  uploadState === "uploading" && "opacity-60 grayscale",
                )}
                fallbackClassName="text-5xl"
              />
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                  {fileName ?? "Saved profile photo"}
                </p>
                <p className="text-sm leading-7 text-ink/72">
                  {uploadState === "uploading"
                    ? "Preparing the image..."
                    : "Save the profile to publish this image."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ProfileAvatar
                name={fullName}
                src={null}
                className="h-36 w-36 rounded-full"
                fallbackClassName="text-5xl"
              />
              <div className="space-y-2">
                <p className="font-display text-3xl uppercase leading-none text-ink">
                  Drop image here
                </p>
                <p className="max-w-sm text-sm leading-7 text-ink/72">
                  Or click to choose a file. The saved profile photo will appear on
                  the public pages after you save.
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
            {hasPhoto ? "Replace Image" : "Choose Image"}
          </Button>
          <Button
            type="button"
            variant="muted"
            onClick={clearFileState}
            disabled={!hasPhoto || uploadState === "uploading"}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
