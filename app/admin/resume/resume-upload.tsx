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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "dragging" | "uploading" | "success";

type UploadedResume = {
  name: string;
  size: number;
  uploadedAt: string;
  type: "PDF";
};

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function ResumeUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadTimeoutRef = useRef<number | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        window.clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

  const statusBadge = useMemo(() => {
    if (uploadState === "uploading") {
      return { label: "Uploading", variant: "blue" as const };
    }

    if (uploadState === "success") {
      return { label: "Resume Ready", variant: "cream" as const };
    }

    if (uploadState === "dragging") {
      return { label: "Drop PDF", variant: "blue" as const };
    }

    return { label: "Resume Upload", variant: "red" as const };
  }, [uploadState]);

  function openPicker() {
    inputRef.current?.click();
  }

  function resetUpload() {
    if (uploadTimeoutRef.current) {
      window.clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }

    setUploadedResume(null);
    setUploadState("idle");
    setError(null);
    setActionNote(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function processFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!isPdfFile(file)) {
      setError("Resume upload accepts PDF files only.");
      setUploadState("idle");
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setError("Resume must be 5MB or smaller.");
      setUploadState("idle");
      return;
    }

    if (uploadTimeoutRef.current) {
      window.clearTimeout(uploadTimeoutRef.current);
    }

    setError(null);
    setActionNote(null);
    setUploadState("uploading");

    uploadTimeoutRef.current = window.setTimeout(() => {
      setUploadedResume({
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        type: "PDF",
      });
      setUploadState("success");
      uploadTimeoutRef.current = null;
    }, 800);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    processFile(event.target.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (uploadState !== "uploading") {
      setUploadState("dragging");
    }
  }

  function handleDragLeave() {
    if (uploadState !== "uploading") {
      setUploadState(uploadedResume ? "success" : "idle");
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    processFile(event.dataTransfer.files?.[0]);
  }

  function handleDownloadClick() {
    setActionNote("Download is not available from this screen yet.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <CardTitle>Resume upload</CardTitle>
            <CardDescription>
              Drag and drop a PDF or click to choose one. The current flow keeps
              the file available in this browser session.
            </CardDescription>
          </div>

          <Separator />

          <button
            type="button"
            onClick={openPicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-72 w-full flex-col items-center justify-center gap-5 rounded-[30px] border-[3px] border-dashed border-ink bg-white/70 px-6 py-8 text-center shadow-[8px_8px_0_var(--ink)] transition",
              uploadState === "dragging" && "bg-accent-blue/10",
              uploadState === "uploading" && "cursor-progress bg-accent-blue/6",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleInputChange}
            />

            <div className="grid h-28 w-24 place-items-center rounded-[22px] border-[3px] border-ink bg-panel shadow-[6px_6px_0_var(--ink)]">
              <div className="space-y-2">
                <div className="mx-auto h-3 w-12 rounded-full bg-accent-red" />
                <p className="font-display text-3xl uppercase leading-none text-ink">
                  PDF
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-display text-3xl uppercase leading-none text-ink sm:text-4xl">
                {uploadState === "uploading"
                  ? "Uploading resume..."
                  : uploadState === "success"
                    ? "Resume uploaded"
                    : "Drop PDF here"}
              </p>
              <p className="max-w-md text-sm leading-7 text-ink/72">
                Upload your resume (PDF only, max 5MB)
              </p>
            </div>
          </button>

          {error ? (
            <p className="text-sm font-semibold leading-6 text-accent-red">{error}</p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="blue"
              onClick={openPicker}
              disabled={uploadState === "uploading"}
            >
              {uploadedResume ? "Replace Resume" : "Choose PDF"}
            </Button>
            <Button
              type="button"
              variant="muted"
              onClick={resetUpload}
              disabled={!uploadedResume || uploadState === "uploading"}
            >
              Remove Resume
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card accent="blue" className="space-y-4">
          <CardContent className="space-y-5">
            <Badge variant="blue">Uploaded File</Badge>
            {uploadedResume ? (
              <>
                <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 shadow-[6px_6px_0_var(--ink)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-16 w-14 place-items-center rounded-[18px] border-[3px] border-ink bg-panel font-display text-2xl uppercase text-ink">
                      PDF
                    </div>
                    <Badge variant="cream">{uploadedResume.type}</Badge>
                  </div>
                  <div className="mt-5 space-y-3">
                    <p className="font-display text-2xl uppercase leading-none text-ink">
                      {uploadedResume.name}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[18px] border-[3px] border-ink bg-panel px-3 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
                          Size
                        </p>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                          {formatFileSize(uploadedResume.size)}
                        </p>
                      </div>
                      <div className="rounded-[18px] border-[3px] border-ink bg-panel px-3 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
                          Uploaded
                        </p>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                          {uploadedResume.uploadedAt}
                        </p>
                      </div>
                      <div className="rounded-[18px] border-[3px] border-ink bg-panel px-3 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
                          Status
                        </p>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                          Ready
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger variant="muted">Open Viewer</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Resume viewer</DialogTitle>
                        <DialogDescription>
                          This modal reserves space for the resume viewer while
                          keeping the upload flow on this page.
                        </DialogDescription>
                      </DialogHeader>
                      <Separator className="my-5" />
                      <div className="rounded-[26px] border-[3px] border-ink bg-panel p-5 shadow-[6px_6px_0_var(--ink)]">
                        <div className="min-h-72 rounded-[22px] border-[3px] border-dashed border-ink/30 bg-white/70 p-5">
                          <p className="font-display text-3xl uppercase leading-none text-ink">
                            {uploadedResume.name}
                          </p>
                          <p className="mt-4 text-sm leading-7 text-ink/72">
                            PDF rendering is not available in this viewer yet.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose variant="blue">Done</DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleDownloadClick}
                  >
                    Download
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 text-sm leading-7 text-ink/72 shadow-[6px_6px_0_var(--ink)]">
                No resume uploaded yet. Once a PDF is added, the file card, actions,
                and viewer panel will appear here.
              </div>
            )}

            {actionNote ? (
              <p className="text-sm font-semibold leading-6 text-ink/72">
                {actionNote}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="space-y-4">
          <CardContent className="space-y-4">
            <Badge variant="cream">Resume Viewer</Badge>
            <div className="rounded-[26px] border-[3px] border-ink bg-white/68 p-5 shadow-[6px_6px_0_var(--ink)]">
              <div className="min-h-52 rounded-[20px] border-[3px] border-dashed border-ink/35 bg-panel/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
                  Viewer panel
                </p>
                <p className="mt-4 text-sm leading-7 text-ink/72">
                  This area reserves space for the resume viewer. It stays
                  lightweight while the upload and review flow is being shaped.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
