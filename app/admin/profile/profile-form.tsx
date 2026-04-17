"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Separator } from "@/components/ui/separator";
import {
  SocialLinkIcon,
  socialLinkOptions,
} from "@/components/social-link-icon";
import { Textarea } from "@/components/ui/textarea";
import { formatProfileUpdatedAt } from "@/lib/profile.shared";

import { profileDefaultValues } from "./profile.default-values";
import { ProfilePhotoUpload } from "./profile-photo-upload";
import {
  adminProfileQueryKey,
  fetchAdminProfileContent,
  updateAdminProfileContentRequest,
} from "./profile.queries";
import { profileSchema } from "./profile.schema";

const MAX_SOCIAL_LINKS = 4;

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

function SocialLabelSelect({
  id,
  href,
  value,
  onBlur,
  onChange,
}: {
  id: string;
  href: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedLabel = value.trim() || "Choose label";
  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return socialLinkOptions;
    }

    return socialLinkOptions.filter((option) =>
      `${option.label} ${option.keywords} ${option.placeholderHref}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [search]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && containerRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
      onBlur();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onBlur();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onBlur, open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        className="flex h-12 w-full items-center justify-between gap-3 rounded-[22px] border-[3px] border-ink bg-white/85 px-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink shadow-[5px_5px_0_var(--ink)] outline-none transition focus-visible:ring-4 focus-visible:ring-accent-blue/30"
        aria-expanded={open}
        aria-haspopup="listbox"
        onBlur={onBlur}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <SocialLinkIcon href={href} label={selectedLabel} />
          <span className="truncate">{selectedLabel}</span>
        </span>
        <span className="text-ink/45">Search</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[60] w-full min-w-72 rounded-[22px] border-[3px] border-ink bg-panel p-3 shadow-[8px_8px_0_var(--ink)]">
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search social label..."
            className="h-11 rounded-[18px] text-xs"
          />

          <div
            role="listbox"
            aria-label="Social label options"
            className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  role="option"
                  aria-selected={option.label === value}
                  className="flex w-full items-center gap-3 rounded-[18px] border-[3px] border-transparent px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink hover:bg-white/70"
                  onClick={() => {
                    onChange(option.label);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full border-[3px] border-ink bg-white/85 shadow-[3px_3px_0_var(--ink)]">
                    <SocialLinkIcon
                      href={option.placeholderHref}
                      label={option.label}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    <span className="mt-1 block truncate text-[0.62rem] tracking-[0.14em] text-ink/48">
                      {option.placeholderHref}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="rounded-[18px] border-[3px] border-dashed border-ink/20 px-3 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink/50">
                No label found.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileForm() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "idle" | "success" | "error";
  }>({
    message:
      "Validation is active. Saving now persists the public profile content.",
    tone: "idle",
  });
  const {
    data: storedProfile,
    error,
    isFetching,
    isLoading,
  } = useQuery({
    queryFn: fetchAdminProfileContent,
    queryKey: adminProfileQueryKey,
    refetchOnWindowFocus: false,
  });

  const form = useForm({
    defaultValues: profileDefaultValues,
    validators: {
      onChange: profileSchema,
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      await saveMutation.mutateAsync(value);
      return value;
    },
  });
  const saveMutation = useMutation({
    mutationFn: updateAdminProfileContentRequest,
    onMutate: () => {
      setFeedback({
        message: "Saving the latest public profile content...",
        tone: "idle",
      });
    },
    onSuccess: async (result) => {
      setFeedback({
        message: result.message,
        tone: "success",
      });
      await queryClient.invalidateQueries({ queryKey: adminProfileQueryKey });
    },
    onError: (mutationError) => {
      setFeedback({
        message:
          mutationError instanceof Error
            ? mutationError.message
            : "The profile could not be saved right now.",
        tone: "error",
      });
    },
  });

  useEffect(() => {
    if (!storedProfile) {
      return;
    }

    form.reset({
      availability: storedProfile.availability,
      about: storedProfile.about,
      email: storedProfile.email,
      fullName: storedProfile.fullName,
      headline: storedProfile.headline,
      location: storedProfile.location,
      phone: storedProfile.phone,
      primaryCta: storedProfile.primaryCta,
      profilePhotoUrl: storedProfile.profilePhotoUrl,
      socialLinks: storedProfile.socialLinks,
      shortIntro: storedProfile.shortIntro,
      focus: storedProfile.focus,
      stats: storedProfile.stats,
    });
  }, [form, storedProfile]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge variant="red">Profile Editor</Badge>
            <CardTitle>Shape the public identity</CardTitle>
            <CardDescription>
              This form now persists public profile content with inline
              validation and shared fallback safety if storage is not ready yet.
            </CardDescription>
          </div>

          <Separator />

          {error ? (
            <p className="text-sm font-semibold leading-6 text-accent-red">
              {error instanceof Error
                ? error.message
                : "The profile could not be loaded right now."}
            </p>
          ) : null}

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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                  These links feed the public footer, profile modules, and
                  resume route.
                </p>
              </div>

              <form.Field name="socialLinks" mode="array">
                {(socialLinksField) => (
                  <div className="space-y-4">
                    {socialLinksField.state.value.map((link, index) => (
                      <Card
                        key={`${link.label}-${link.href}-${index}`}
                        accent={
                          index % 3 === 1
                            ? "blue"
                            : index % 3 === 2
                              ? "red"
                              : "cream"
                        }
                        className="p-4"
                      >
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button
                              type="button"
                              variant="muted"
                              size="sm"
                              onClick={() =>
                                socialLinksField.removeValue(index)
                              }
                              disabled={
                                socialLinksField.state.value.length <= 1
                              }
                            >
                              Remove
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <form.Field
                              name={`socialLinks[${index}].label` as const}
                            >
                              {(field) => (
                                <div className="space-y-2">
                                  <FieldLabel htmlFor={field.name}>
                                    Link label {index + 1}
                                  </FieldLabel>
                                  <SocialLabelSelect
                                    id={field.name}
                                    href={link.href}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={field.handleChange}
                                  />
                                  <FieldError
                                    errors={field.state.meta.errors}
                                    touched={field.state.meta.isTouched}
                                  />
                                </div>
                              )}
                            </form.Field>

                            <form.Field
                              name={`socialLinks[${index}].href` as const}
                            >
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="blue"
                        onClick={() =>
                          socialLinksField.pushValue({ label: "", href: "" })
                        }
                        disabled={
                          socialLinksField.state.value.length >=
                          MAX_SOCIAL_LINKS
                        }
                      >
                        Add Social Link
                      </Button>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
                        {socialLinksField.state.value.length}/{MAX_SOCIAL_LINKS}
                      </p>
                    </div>

                    <FieldError
                      errors={socialLinksField.state.meta.errors}
                      touched
                    />
                  </div>
                )}
              </form.Field>
            </section>

            <Separator />

            <section className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                  Focus Areas
                </p>
                <p className="text-sm leading-7 text-ink/70">
                  Key areas of expertise for the profile.
                </p>
              </div>

              <form.Field name="focus" mode="array">
                {(focusField) => (
                  <div className="space-y-4">
                    {focusField.state.value.map((_, index) => (
                      <div key={`focus-${index}`} className="flex items-start gap-4">
                        <form.Field name={`focus[${index}]` as const}>
                          {(field) => (
                            <div className="flex-1 space-y-2">
                              <Input
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                placeholder="E.g. Product-minded engineering"
                              />
                              <FieldError
                                errors={field.state.meta.errors}
                                touched={field.state.meta.isTouched}
                              />
                            </div>
                          )}
                        </form.Field>
                        <Button
                          type="button"
                          variant="muted"
                          disabled={focusField.state.value.length <= 1}
                          onClick={() => focusField.removeValue(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="muted"
                        className="bg-white"
                        onClick={() => focusField.pushValue("")}
                      >
                        Add Focus Area
                      </Button>
                    </div>

                    <FieldError errors={focusField.state.meta.errors} touched />
                  </div>
                )}
              </form.Field>
            </section>

            <Separator />

            <section className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                  Key Stats
                </p>
                <p className="text-sm leading-7 text-ink/70">
                  Highlight key performance or experience metrics.
                </p>
              </div>

              <form.Field name="stats" mode="array">
                {(statsField) => (
                  <div className="space-y-4">
                    {statsField.state.value.map((stat, index) => (
                      <Card key={`stat-${index}`} className="p-4 bg-white/50 border-ink/10">
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">Stat #{index + 1}</p>
                            <Button
                              type="button"
                              variant="muted"
                              size="sm"
                              onClick={() => statsField.removeValue(index)}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <form.Field name={`stats[${index}].value` as const}>
                              {(field) => (
                                <div className="space-y-2">
                                  <FieldLabel htmlFor={field.name}>Metric Value</FieldLabel>
                                  <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                      field.handleChange(event.target.value)
                                    }
                                    className="bg-white"
                                    placeholder="e.g. 18"
                                  />
                                  <FieldError
                                    errors={field.state.meta.errors}
                                    touched={field.state.meta.isTouched}
                                  />
                                </div>
                              )}
                            </form.Field>

                            <form.Field name={`stats[${index}].label` as const}>
                              {(field) => (
                                <div className="space-y-2">
                                  <FieldLabel htmlFor={field.name}>Metric Label</FieldLabel>
                                  <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                      field.handleChange(event.target.value)
                                    }
                                    className="bg-white"
                                    placeholder="e.g. Projects shipped"
                                  />
                                  <FieldError
                                    errors={field.state.meta.errors}
                                    touched={field.state.meta.isTouched}
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>
                          
                          <form.Field name={`stats[${index}].detail` as const}>
                              {(field) => (
                                <div className="space-y-2">
                                  <FieldLabel htmlFor={field.name}>Detail / Context</FieldLabel>
                                  <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                      field.handleChange(event.target.value)
                                    }
                                    className="bg-white"
                                    placeholder="e.g. Across SaaS, internal tools..."
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

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="muted"
                        className="bg-white"
                        onClick={() =>
                          statsField.pushValue({ label: "", value: "", detail: "" })
                        }
                      >
                        Add Stat Card
                      </Button>
                    </div>

                    <FieldError errors={statsField.state.meta.errors} touched />
                  </div>
                )}
              </form.Field>
            </section>


            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={form.state.isSubmitting || isLoading || isFetching}
              >
                {form.state.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
              {feedback.tone === "success" ? (
                <Badge variant="blue">Profile Saved</Badge>
              ) : feedback.tone === "error" ? (
                <Badge variant="red">Save failed</Badge>
              ) : (
                <p className="text-sm leading-7 text-ink/65">
                  {feedback.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <form.Field name="profilePhotoUrl">
          {(field) => (
            <ProfilePhotoUpload
              fullName={form.state.values.fullName}
              value={field.state.value}
              onChange={(nextValue) => field.handleChange(nextValue)}
            />
          )}
        </form.Field>

        <Card accent="blue" className="space-y-4">
          <CardContent className="space-y-4">
            <Badge variant="blue">Profile Snapshot</Badge>
            <div className="flex items-start gap-4">
              <ProfileAvatar
                name={form.state.values.fullName}
                src={form.state.values.profilePhotoUrl}
                className="h-20 w-20 rounded-[22px]"
                fallbackClassName="text-3xl"
              />
              <div className="space-y-2">
                <CardTitle>{form.state.values.fullName}</CardTitle>
                <CardDescription>
                  {form.state.values.headline} • {form.state.values.location}
                </CardDescription>
              </div>
            </div>
            <Separator />
            <p className="text-sm leading-7 text-ink/78">
              {form.state.values.shortIntro}
            </p>
            <div className="rounded-[20px] border-[3px] border-ink bg-white/72 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Current Source
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Badge
                  variant={
                    storedProfile?.source === "database" ? "blue" : "yellow"
                  }
                >
                  {storedProfile?.source === "database"
                    ? "Database Saved"
                    : "Fallback Content"}
                </Badge>
                <p className="text-sm leading-6 text-ink/72">
                  {formatProfileUpdatedAt(storedProfile?.updatedAt ?? null)}
                </p>
              </div>
            </div>
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
