"use client";

import { useForm } from "@tanstack/react-form";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { profileDefaultValues } from "./profile.default-values";
import { ProfilePhotoUpload } from "./profile-photo-upload";
import { profileSchema } from "./profile.schema";

const socialLinkSlots = [0, 1, 2] as const;

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

export function ProfileForm() {
  const [saveState, setSaveState] = useState<"idle" | "success">("idle");

  const form = useForm({
    defaultValues: profileDefaultValues,
    validators: {
      onChange: profileSchema,
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSaveState("success");
      return value;
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge variant="red">Profile Editor</Badge>
            <CardTitle>Shape the public identity</CardTitle>
            <CardDescription>
              This form keeps profile content structured with inline validation
              and clear save feedback.
            </CardDescription>
          </div>

          <Separator />

          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <section className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="fullName">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Rizal Achmad"
                      />
                      <FieldError
                        errors={field.state.meta.errors}
                        touched={field.state.meta.isTouched}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="headline">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Headline</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Full-Stack Product Engineer"
                      />
                      <FieldError
                        errors={field.state.meta.errors}
                        touched={field.state.meta.isTouched}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="shortIntro">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Short intro</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="A concise hero line for the public landing page."
                    />
                    <FieldError
                      errors={field.state.meta.errors}
                      touched={field.state.meta.isTouched}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="about">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel htmlFor={field.name}>About</FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="A longer about section for resume and profile pages."
                      className="min-h-40"
                    />
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
              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="location">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Jakarta, Indonesia"
                      />
                      <FieldError
                        errors={field.state.meta.errors}
                        touched={field.state.meta.isTouched}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="availability">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Availability</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Available for selective 2026 opportunities"
                      />
                      <FieldError
                        errors={field.state.meta.errors}
                        touched={field.state.meta.isTouched}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="name@example.com"
                      />
                      <FieldError
                        errors={field.state.meta.errors}
                        touched={field.state.meta.isTouched}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="phone">
                  {(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="+62 812 5555 2401"
                      />
                      <FieldError
                        errors={field.state.meta.errors}
                        touched={field.state.meta.isTouched}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="primaryCta">
                {(field) => (
                  <div className="space-y-2">
                    <FieldLabel htmlFor={field.name}>Primary CTA</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Open the project archive"
                    />
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
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                  Social links
                </p>
                <p className="text-sm leading-7 text-ink/70">
                  These links feed the public footer, profile modules, and resume route.
                </p>
              </div>

              <div className="space-y-4">
                {socialLinkSlots.map((index) => (
                  <Card
                    key={index}
                    accent={index === 1 ? "blue" : index === 2 ? "red" : "cream"}
                    className="p-4"
                  >
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <form.Field name={`socialLinks[${index}].label` as const}>
                        {(field) => (
                          <div className="space-y-2">
                            <FieldLabel htmlFor={field.name}>
                              Link label {index + 1}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder="GitHub"
                            />
                            <FieldError
                              errors={field.state.meta.errors}
                              touched={field.state.meta.isTouched}
                            />
                          </div>
                        )}
                      </form.Field>

                      <form.Field name={`socialLinks[${index}].href` as const}>
                        {(field) => (
                          <div className="space-y-2">
                            <FieldLabel htmlFor={field.name}>
                              Link URL {index + 1}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder="https://github.com/..."
                            />
                            <FieldError
                              errors={field.state.meta.errors}
                              touched={field.state.meta.isTouched}
                            />
                          </div>
                        )}
                      </form.Field>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button type="submit" size="lg" disabled={form.state.isSubmitting}>
                {form.state.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
              {saveState === "success" ? (
                <Badge variant="blue">Saved in this session</Badge>
              ) : (
                <p className="text-sm leading-7 text-ink/65">
                  Validation is active. Save keeps the update in this session.
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ProfilePhotoUpload />

        <Card accent="blue" className="space-y-4">
          <CardContent className="space-y-4">
            <Badge variant="blue">Profile Snapshot</Badge>
            <CardTitle>{form.state.values.fullName}</CardTitle>
            <CardDescription>
              {form.state.values.headline} • {form.state.values.location}
            </CardDescription>
            <Separator />
            <p className="text-sm leading-7 text-ink/78">
              {form.state.values.shortIntro}
            </p>
          </CardContent>
        </Card>

        <Card className="space-y-4">
          <CardContent className="space-y-4">
            <Badge variant="cream">Publishing Notes</Badge>
            <div className="space-y-3 text-sm leading-7 text-ink/78">
              <p>
                The profile editor keeps the public identity, CTA copy, and
                social links aligned in one place.
              </p>
              <p>
                Social links, CTA copy, and the about section are validated
                before the save completes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
