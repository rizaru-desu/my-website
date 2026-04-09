"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { submitContactAction } from "@/app/actions/contact.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/ui/editorial-card";
import { Input } from "@/components/ui/input";
import { SectionShell } from "@/components/ui/section-shell";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { profile } from "@/lib/mock-content";
import {
  contactSchema,
  type ContactFormValues,
} from "@/lib/validations/contact.schema";

type SubmissionState =
  | { tone: "idle"; message: string }
  | { tone: "success"; message: string }
  | { tone: "error"; message: string };

const defaultValues: ContactFormValues = {
  email: "",
  message: "",
  name: "",
  subject: "",
  website: "",
};

const idleSubmissionMessage =
  "Send a note for recruiter outreach, collaboration ideas, or a direct intro.";

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

export function ContactSection() {
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
      onChange: contactSchema,
      onSubmit: contactSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setSubmissionState({
        tone: "idle",
        message: "Sending your note into the studio inbox...",
      });

      const formData = new FormData();
      formData.set("name", value.name);
      formData.set("email", value.email);
      formData.set("subject", value.subject);
      formData.set("message", value.message);
      formData.set("website", value.website);

      const result = await submitContactAction(formData);

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
    <SectionShell
      label="Contact"
      title="Start the conversation without leaving the portfolio."
      description="This contact pass is intentionally direct: real inbox persistence, clear validation, and no fake mail-app theatrics."
      contentClassName="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
    >
      <EditorialCard accent="red" className="space-y-6">
        <div className="space-y-4">
          <Badge variant="red">Open Channel</Badge>
          <h3 className="font-display text-5xl uppercase leading-none text-ink">
            Write once. Land directly in the admin inbox.
          </h3>
          <p className="text-base leading-8 text-ink/78">
            Use the form for recruiter outreach, project inquiries, or a quick hello.
            Each valid submission is stored as a real message record instead of
            disappearing into a mock state.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/58">
              Email
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-3 block font-display text-2xl uppercase leading-none text-ink underline decoration-[3px] underline-offset-4"
            >
              {profile.email}
            </a>
          </div>

          <div className="rounded-[24px] border-[3px] border-ink bg-accent-blue px-4 py-4 text-white shadow-[5px_5px_0_var(--ink)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/78">
              Best For
            </p>
            <p className="mt-3 font-display text-2xl uppercase leading-none">
              Hiring, freelance, product collaboration
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Elsewhere
          </p>
          <div className="flex flex-wrap gap-3">
            {profile.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="button-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </EditorialCard>

      <EditorialCard accent="blue" className="space-y-6">
        <div className="space-y-3">
          <Badge variant="blue">Message Form</Badge>
          <h3 className="font-display text-4xl uppercase leading-none text-ink">
            Clear inputs, honest follow-through.
          </h3>
          <p className="text-sm leading-7 text-ink/76">
            Required fields stay visible, validation happens inline, and successful
            submissions go straight into the live admin message flow.
          </p>
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

            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                  >
                    Email
                  </label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      resetSubmissionState();
                      field.handleChange(event.target.value);
                    }}
                    placeholder="name@company.com"
                  />
                  <FieldError
                    errors={field.state.meta.errors}
                    touched={field.state.meta.isTouched}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="subject">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Subject
                </label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    resetSubmissionState();
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Senior product role inquiry"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="message">
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/68"
                >
                  Message
                </label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    resetSubmissionState();
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Share the role, project, or context you have in mind..."
                  className="min-h-44"
                />
                <FieldError
                  errors={field.state.meta.errors}
                  touched={field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="website">
            {(field) => (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor={field.name}>Website</label>
                <input
                  id={field.name}
                  name={field.name}
                  tabIndex={-1}
                  autoComplete="off"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`max-w-xl text-sm leading-7 ${
                submissionState.tone === "error"
                  ? "text-accent-red"
                  : submissionState.tone === "success"
                    ? "text-accent-blue"
                    : "text-ink/72"
              }`}
            >
              {submissionState.message}
            </p>
            <Button type="submit" variant="blue" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </EditorialCard>
    </SectionShell>
  );
}
