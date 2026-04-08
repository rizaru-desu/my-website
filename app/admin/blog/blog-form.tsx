"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { blogSchema, blogStatusValues, type BlogFormValues } from "./blog.schema";

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

  return (
    <p className="text-sm font-semibold leading-6 text-accent-red">{message}</p>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
    >
      {children}
    </label>
  );
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function CoverUploadField({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processFile = (file: File | null) => {
    if (!file) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!file.type.startsWith("image/")) {
      setUploadMessage("Choose an image file for the cover placeholder.");
      return;
    }

    setUploadMessage(null);
    setIsUploading(true);

    timeoutRef.current = window.setTimeout(() => {
      onChange(file.name);
      setIsUploading(false);
      setUploadMessage("Cover image selected in this session.");
    }, 650);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className={`rounded-[28px] border-[3px] border-dashed px-5 py-6 transition ${
          isDragging
            ? "border-accent-blue bg-blue-50"
            : "border-ink/25 bg-white/70"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
            Cover Placeholder Upload
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Drop an image here or browse for a cover image. This stays in the
            current session and fills the cover field.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="blue"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : value ? "Replace Cover" : "Choose Cover"}
            </Button>
            {value ? (
              <Button type="button" variant="outline" onClick={() => onChange("")}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {value ? (
        <div className="rounded-[24px] border-[3px] border-ink bg-white/70 p-4 shadow-[6px_6px_0_var(--ink)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            Selected Cover Placeholder
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
            <div className="grid h-24 place-items-center rounded-[20px] border-[3px] border-ink bg-[linear-gradient(135deg,#dce8ff_0%,#fff1e0_100%)] px-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
              Cover Image
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl uppercase leading-none text-ink">
                {value}
              </p>
              <p className="text-sm leading-6 text-ink/70">
                UI-only placeholder registered for the blog card and article hero.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {uploadMessage ? (
        <p className="text-sm font-semibold leading-6 text-accent-blue">{uploadMessage}</p>
      ) : null}
    </div>
  );
}

type BlogFormProps = {
  defaultValues: BlogFormValues;
  mode: "create" | "edit";
  onCancel: () => void;
  onDelete?: () => void;
  onSubmit: (values: BlogFormValues) => Promise<void>;
};

export function BlogForm({
  defaultValues,
  mode,
  onCancel,
  onDelete,
  onSubmit,
}: BlogFormProps) {
  const form = useForm({
    defaultValues,
    validators: {
      onChange: blogSchema,
      onSubmit: blogSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
      return value;
    },
  });

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card className="bg-white/75">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={mode === "create" ? "blue" : "red"}>
              {mode === "create" ? "New Post" : "Edit Post"}
            </Badge>
            <Badge variant="cream">Local Save</Badge>
          </div>
          <CardTitle>
            {mode === "create"
              ? "Draft a new article for the public blog."
              : "Tune editorial metadata, publishing, and presentation details."}
          </CardTitle>
          <CardDescription>
            This editor is UI-only, validated by TanStack Form and Zod, and mirrors the
            same structured workspace approach used in projects.
          </CardDescription>
        </CardContent>
      </Card>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Basic Info
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Control the title, slug, excerpt, category, and tags used across the blog
            listing and the article header.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="title">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Designing Portfolios for Recruiter Attention"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>

          <form.Field name="slug">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="designing-portfolios-for-recruiter-attention"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Lowercase, hyphen-separated route segment.
                </p>
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="excerpt">
          {(field) => (
            <div className="space-y-2">
              <FieldLabel htmlFor={field.name}>Excerpt</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="A practical breakdown of how to make personal work feel distinct without sacrificing trust."
                className="min-h-28"
              />
              <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="category">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Field Notes"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>

          <form.Field name="tags">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value.join(", ")}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(parseCommaList(event.target.value))}
                  placeholder="Portfolio, UX, Personal Branding"
                  className="min-h-28"
                />
                <p className="text-sm leading-6 text-ink/60">Separate each tag with a comma.</p>
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Content
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Shape the core article body, reading estimate, and whether this post should
            be promoted in the featured editorial rail.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="readingTime">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Reading time</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="6 min read"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>

          <form.Field name="featured">
            {(field) => (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                  Featured rail
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={field.state.value ? "default" : "muted"}
                    onClick={() => field.handleChange(true)}
                  >
                    Featured
                  </Button>
                  <Button
                    type="button"
                    variant={!field.state.value ? "outline" : "muted"}
                    onClick={() => field.handleChange(false)}
                  >
                    Standard
                  </Button>
                </div>
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="content">
          {(field) => (
            <div className="space-y-2">
              <FieldLabel htmlFor={field.name}>Content</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Use markdown-like structure or article copy blocks to simulate the full story."
                className="min-h-72"
              />
              <p className="text-sm leading-6 text-ink/60">
                This is a rich-editor-like shell for now, using a single textarea in the
                UI-only phase.
              </p>
              <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Publishing
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Manage release state, publication timing, and authorship details for the
            public blog experience.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
            Status
          </p>
          <form.Field name="status">
            {(field) => (
              <div className="flex flex-wrap gap-3">
                {blogStatusValues.map((status) => {
                  const variant =
                    field.state.value === status
                      ? status === "published"
                        ? "blue"
                        : status === "draft"
                          ? "default"
                          : "outline"
                      : "muted";

                  return (
                    <Button
                      key={status}
                      type="button"
                      variant={variant}
                      onClick={() => field.handleChange(status)}
                    >
                      {status}
                    </Button>
                  );
                })}
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="publishDate">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Publish date</FieldLabel>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>

          <form.Field name="authorName">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Author name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Rizal Achmad"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            SEO
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Optional metadata for search previews and article-level discoverability.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="seoTitle">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>SEO title</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Designing Portfolios for Recruiter Attention"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>

          <form.Field name="seoDescription">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>SEO description</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Practical guidance on making portfolio work feel distinct and recruiter-friendly."
                  className="min-h-28"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Media
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Add a cover image so the article card and hero surface feel ready
            for a future media workflow.
          </p>
        </div>

        <form.Field name="coverImagePlaceholder">
          {(field) => (
            <div className="space-y-2">
              <CoverUploadField
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
              <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>
      </section>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Post"
              : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset Fields
        </Button>
        <Button type="button" variant="muted" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete ? (
          <Button type="button" variant="ink" onClick={onDelete}>
            Delete Post
          </Button>
        ) : null}
      </div>
    </form>
  );
}
