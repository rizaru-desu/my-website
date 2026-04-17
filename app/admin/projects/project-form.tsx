"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  projectAccentValues,
  projectSchema,
  projectStatusValues,
  type ProjectFormValues,
} from "./project.schema";

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

function parseLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMetricList(value: string): ProjectFormValues["metrics"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return {
          label: line,
          value: "",
        };
      }

      return {
        label: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      };
    });
}

function formatMetricList(value: ProjectFormValues["metrics"]) {
  return value.map((metric) => `${metric.label}: ${metric.value}`).join("\n");
}

function parseGalleryList(value: string): ProjectFormValues["gallery"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");

      if (separatorIndex === -1) {
        return {
          caption: "",
          title: line,
        };
      }

      return {
        caption: line.slice(separatorIndex + 1).trim(),
        title: line.slice(0, separatorIndex).trim(),
      };
    });
}

function formatGalleryList(value: ProjectFormValues["gallery"]) {
  return value.map((item) => `${item.title} | ${item.caption}`).join("\n");
}

type ProjectFormProps = {
  defaultValues: ProjectFormValues;
  mode: "create" | "edit";
  onCancel: () => void;
  onDelete?: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
};

export function ProjectForm({
  defaultValues,
  mode,
  onCancel,
  onDelete,
  onSubmit,
}: ProjectFormProps) {
  const form = useForm({
    defaultValues,
    validators: {
      onChange: projectSchema,
      onSubmit: projectSchema,
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
              {mode === "create" ? "New Project" : "Edit Project"}
            </Badge>
            <Badge variant="cream">Live API</Badge>
          </div>
          <CardTitle>
            {mode === "create"
              ? "Add a new case study to the archive."
              : "Refine the project story, metadata, and publishing details."}
          </CardTitle>
          <CardDescription>
            Every save now writes to the live project database with inline Zod
            validation and the same public/admin data model.
          </CardDescription>
        </CardContent>
      </Card>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Core Story
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Cover the headline framing, slug, summary, and the main narrative used
            throughout the public case-study presentation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <form.Field name="title">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Pulse Portfolio Platform"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
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
                  placeholder="pulse-portfolio-platform"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Lowercase, hyphen-separated route segment.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

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
                  placeholder="Portfolio Platform"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="year">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Year</FieldLabel>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="2026"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="summary">
          {(field) => (
            <div className="space-y-2">
              <FieldLabel htmlFor={field.name}>Summary</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="A recruiter-friendly one-paragraph summary for the public card view."
                className="min-h-28"
              />
              <p className="text-sm leading-6 text-ink/60">
                Used in listing cards and high-level project introductions.
              </p>
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="impactSummary">
          {(field) => (
            <div className="space-y-2">
              <FieldLabel htmlFor={field.name}>Impact Summary</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Clarified content hierarchy and reduced admin friction in the core showcase experience."
                className="min-h-28"
              />
              <p className="text-sm leading-6 text-ink/60">
                Used on project cards and the public case-study snapshot.
              </p>
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched}
              />
            </div>
          )}
        </form.Field>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="challenge">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Challenge</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Most portfolio sites either look generic or bury proof beneath decoration..."
                  className="min-h-40"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="outcome">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Outcome</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="The final concept balances personality with trust..."
                  className="min-h-40"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="process">
          {(field) => (
            <div className="space-y-2">
              <FieldLabel htmlFor={field.name}>Process Steps</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value.join("\n")}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(parseLineList(event.target.value))}
                placeholder={
                  "Mapped the recruiter journey into three beats...\nBuilt a visual language around poster-style framing..."
                }
                className="min-h-40"
              />
              <p className="text-sm leading-6 text-ink/60">
                Put each process step on its own line.
              </p>
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched}
              />
            </div>
          )}
        </form.Field>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Positioning & Publishing
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Set ownership, publish state, feature priority, and basic ordering for the
            project archive.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="clientOrCompany">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Client or company</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Personal Product Concept"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Product Designer + Full-Stack Engineer"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="duration">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Duration</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="4 weeks"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
            Status
          </p>
          <form.Field name="status">
            {(field) => (
              <div className="flex flex-wrap gap-3">
                {projectStatusValues.map((status) => {
                  const isActive = field.state.value === status;
                  const variant = isActive
                    ? status === "published"
                      ? "blue"
                      : status === "archived"
                        ? "ink"
                        : "default"
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

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
            Accent
          </p>
          <form.Field name="accent">
            {(field) => (
              <div className="flex flex-wrap gap-3">
                {projectAccentValues.map((accent) => (
                  <Button
                    key={accent}
                    type="button"
                    variant={
                      field.state.value === accent
                        ? accent === "blue"
                          ? "blue"
                          : accent === "cream"
                            ? "outline"
                            : "default"
                        : "muted"
                    }
                    onClick={() => field.handleChange(accent)}
                  >
                    {accent}
                  </Button>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
            Featured rail
          </p>
          <form.Field name="featured">
            {(field) => (
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
            )}
          </form.Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="sortOrder">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Sort order</FieldLabel>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="1"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Optional manual ordering for curated project rails.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="thumbnailPlaceholder">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Thumbnail placeholder</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Poster cover with red impact plate"
                />
                <p className="text-sm leading-6 text-ink/60">
                  UI-only note for how the future thumbnail should be framed.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Tags, Stack & Links
          </p>
          <p className="text-sm leading-7 text-ink/72">
            These fields support search, filtering, metrics, and the detail-page
            metadata shown throughout the public portfolio.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="tags">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value.join(", ")}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(parseCommaList(event.target.value))}
                  placeholder="Portfolio, Editorial, Case Study"
                  className="min-h-28"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Separate each tag with a comma.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="techStack">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Tech stack</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value.join(", ")}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(parseCommaList(event.target.value))}
                  placeholder="Next.js, TypeScript, Tailwind CSS"
                  className="min-h-28"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Separate each technology with a comma.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="impactBullets">
          {(field) => (
            <div className="space-y-2">
              <FieldLabel htmlFor={field.name}>Impact bullets</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value.join("\n")}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(parseLineList(event.target.value))}
                placeholder={"Reduced admin friction\nClarified public proof hierarchy"}
                className="min-h-36"
              />
              <p className="text-sm leading-6 text-ink/60">
                Put each impact note on its own line.
              </p>
              <FieldError
                errors={field.state.meta.errors}
                touched={field.state.meta.isTouched}
              />
            </div>
          )}
        </form.Field>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="metrics">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Metrics</FieldLabel>
                <Textarea
                  id={field.name}
                  value={formatMetricList(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(parseMetricList(event.target.value))}
                  placeholder={"Public sections: 6\nDatabase entities: 24\nHero scan time: <10 sec"}
                  className="min-h-36"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Use one metric per line in `Label: Value` format.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="gallery">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Gallery</FieldLabel>
                <Textarea
                  id={field.name}
                  value={formatGalleryList(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(parseGalleryList(event.target.value))}
                  placeholder={
                    "Hero Composition | Layered title treatment tuned for fast first impressions.\nContent Grid | Poster-like cards that make projects feel curated."
                  }
                  className="min-h-36"
                />
                <p className="text-sm leading-6 text-ink/60">
                  Use one gallery item per line in `Title | Caption` format.
                </p>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="projectUrl">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Project URL</FieldLabel>
                <Input
                  id={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="https://portfolio-rizal.com/projects/pulse-portfolio-platform"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="githubUrl">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>GitHub URL</FieldLabel>
                <Input
                  id={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="https://github.com/rizal-achmad/project-repo"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Project"
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
            Delete Project
          </Button>
        ) : null}
      </div>
    </form>
  );
}
