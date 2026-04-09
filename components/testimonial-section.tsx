"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";

import { submitTestimonialAction } from "@/app/actions/testimonial.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/ui/editorial-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getTestimonialRelationLabel,
  testimonialRelationValues,
  type PublicTestimonialInput,
} from "@/lib/testimonials.shared";
import {
  testimonialSchema,
  type TestimonialFormValues,
} from "@/lib/validations/testimonial.schema";

type SubmissionState =
  | { tone: "idle"; message: string }
  | { tone: "success"; message: string }
  | { tone: "error"; message: string };

const defaultValues: TestimonialFormValues = {
  _honeypot: "",
  company: "",
  message: "",
  name: "",
  rating: 5,
  relation: "COLLEAGUE",
  role: "",
};

const idleSubmissionMessage =
  "Share a recommendation, collaboration note, or recruiter-facing perspective.";

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

  return <p className="text-sm font-semibold leading-6 text-accent-red">{message}</p>;
}

function SelectField({
  children,
  id,
  onBlur,
  onChange,
  value,
}: {
  children: ReactNode;
  id: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-12 w-full rounded-[22px] border-[3px] border-ink bg-white/85 px-4 text-sm font-medium text-ink shadow-[5px_5px_0_var(--ink)] outline-none transition focus-visible:ring-4 focus-visible:ring-accent-blue/30"
    >
      {children}
    </select>
  );
}

export function TestimonialSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    tone: "idle",
    message: idleSubmissionMessage,
  });

  function resetSubmissionState() {
    setSubmissionState({
      tone: "idle",
      message: idleSubmissionMessage,
    });
  }

  const form = useForm({
    defaultValues,
    validators: {
      onChange: testimonialSchema,
      onSubmit: testimonialSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setSubmissionState({
        tone: "idle",
        message: "Sending your testimonial into the moderation queue...",
      });

      const result = await submitTestimonialAction(value as PublicTestimonialInput);

      setIsSubmitting(false);

      if (!result.ok) {
        setSubmissionState({
          tone: "error",
          message: result.message,
        });
        return;
      }

      form.reset();
      setSubmissionState({
        tone: "success",
        message: result.message,
      });
    },
  });

  return (
    <EditorialCard accent="blue" className="space-y-6">
      <div className="space-y-3">
        <Badge variant="blue">Leave a Testimonial</Badge>
        <h3 className="font-display text-4xl uppercase leading-none text-ink">
          Share a recommendation that can earn a place in the proof section.
        </h3>
        <p className="text-sm leading-7 text-ink/76">
          New testimonials are reviewed before anything appears publicly. Clear,
          specific notes work best.
        </p>
      </div>

      <div
        className={`rounded-[24px] border-[3px] px-4 py-3 text-sm font-semibold leading-6 shadow-[5px_5px_0_var(--ink)] ${
          submissionState.tone === "error"
            ? "border-accent-red bg-white text-accent-red"
            : submissionState.tone === "success"
              ? "border-accent-blue bg-white text-accent-blue"
              : "border-ink bg-white/75 text-ink/72"
        }`}
      >
        {submissionState.message}
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Name
                </label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    resetSubmissionState();
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Your name"
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
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Role
                </label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    resetSubmissionState();
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Lead Recruiter"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="company">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Company
                </label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    resetSubmissionState();
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Optional"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="relation">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Relationship
                </label>
                <SelectField
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    resetSubmissionState();
                    field.handleChange(value as TestimonialFormValues["relation"]);
                  }}
                >
                  {testimonialRelationValues.map((relation) => (
                    <option key={relation} value={relation}>
                      {getTestimonialRelationLabel(relation)}
                    </option>
                  ))}
                </SelectField>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="rating">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Rating
                </label>
                <SelectField
                  id={field.name}
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    resetSubmissionState();
                    field.handleChange(Number(value));
                  }}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={String(rating)}>
                      {rating} {rating === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </SelectField>
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="message">
          {(field) => (
            <div className="space-y-2">
              <label
                htmlFor={field.name}
                className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
              >
                Testimonial
              </label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  resetSubmissionState();
                  field.handleChange(event.target.value);
                }}
                placeholder="What made the collaboration, delivery, or portfolio impression worth recommending?"
              />
              <div className="flex items-center justify-between gap-3">
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/52">
                  {field.state.value.length}/500
                </p>
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="_honeypot">
          {(field) => (
            <div className="pointer-events-none absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor={field.name}>Leave this field empty</label>
              <input
                id={field.name}
                tabIndex={-1}
                autoComplete="off"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <Button type="submit" variant="blue" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Testimonial"}
        </Button>
      </form>
    </EditorialCard>
  );
}
