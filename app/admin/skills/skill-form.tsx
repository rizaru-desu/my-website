"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { skillLevelValues, skillSchema, type SkillFormValues } from "./skill.schema";

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

type SkillFormProps = {
  defaultValues: SkillFormValues;
  mode: "create" | "edit";
  onCancel: () => void;
  onDelete?: () => void;
  onSubmit: (values: SkillFormValues) => Promise<void>;
};

export function SkillForm({
  defaultValues,
  mode,
  onCancel,
  onDelete,
  onSubmit,
}: SkillFormProps) {
  const form = useForm({
    defaultValues,
    validators: {
      onChange: skillSchema,
      onSubmit: skillSchema,
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
              {mode === "create" ? "New Skill" : "Edit Skill"}
            </Badge>
            <Badge variant="cream">Local Save</Badge>
          </div>
          <CardTitle>
            {mode === "create"
              ? "Add a skill to the public capabilities board."
              : "Refine how a skill is grouped and highlighted."}
          </CardTitle>
          <CardDescription>
            This editor stays intentionally lean: skill name, category, level, and
            featured state, all managed locally with inline validation.
          </CardDescription>
        </CardContent>
      </Card>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Basic Info
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Define the skill name and the category group it should live under in the
            public portfolio and internal workspace.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Skill name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Next.js"
                />
                <FieldError errors={field.state.meta.errors} touched={field.state.meta.isTouched} />
              </div>
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <div className="space-y-2">
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Frontend Systems"
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
            Positioning
          </p>
          <p className="text-sm leading-7 text-ink/72">
            Control how strongly the skill is framed and whether it should be surfaced as
            one of the featured capabilities.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
            Level
          </p>
          <form.Field name="level">
            {(field) => (
              <div className="flex flex-wrap gap-3">
                {skillLevelValues.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={
                      field.state.value === level
                        ? level === "advanced"
                          ? "blue"
                          : level === "intermediate"
                            ? "default"
                            : "outline"
                        : "muted"
                    }
                    onClick={() => field.handleChange(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
            Featured
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
      </section>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Skill"
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
            Delete Skill
          </Button>
        ) : null}
      </div>
    </form>
  );
}
