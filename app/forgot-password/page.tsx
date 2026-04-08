"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

type ResetRequestState =
  | { tone: "idle"; message: string }
  | { tone: "error"; message: string }
  | { tone: "success"; message: string };

const idleState: ResetRequestState = {
  tone: "idle",
  message:
    "Enter the login email for your account. If it exists, a reset link will be sent to that inbox.",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestState, setRequestState] = useState<ResetRequestState>(idleState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setRequestState({
        tone: "error",
        message: "Enter the email address first.",
      });
      return;
    }

    setIsSubmitting(true);
    setRequestState({
      tone: "idle",
      message: "Preparing the reset email and checking the account record...",
    });

    const redirectTo =
      typeof window === "undefined"
        ? "/reset-password"
        : `${window.location.origin}/reset-password`;

    const result = await authClient.requestPasswordReset({
      email: normalizedEmail,
      redirectTo,
    });

    setIsSubmitting(false);

    if (result.error) {
      setRequestState({
        tone: "error",
        message:
          typeof result.error.message === "string" && result.error.message
            ? result.error.message
            : "Unable to start the password reset flow right now.",
      });
      return;
    }

    setEmail("");
    setRequestState({
      tone: "success",
      message:
        "If that email exists in the system, a password reset link is on its way. Open the link to continue on the reset form.",
    });
  }

  return (
    <div className="px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="blue">Password Recovery</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Password Reset
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Request a password reset link.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              This starts the standard email-based recovery flow. The email
              contains a secure link back to the reset form in this app.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What happens next</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>1. Enter the login email tied to your account.</p>
                <p>2. A reset link is sent if the account exists.</p>
                <p>3. The link opens the reset-password form with a secure token.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-panel/95 px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Request Reset</Badge>
              <CardTitle>Send the recovery email</CardTitle>
              <CardDescription>
                Enter the email you use to sign in and we will handle the next
                step from there.
              </CardDescription>
            </div>

            <Separator />

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                >
                  Account email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div
                className={
                  requestState.tone === "success"
                    ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                    : requestState.tone === "error"
                      ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                      : "rounded-[24px] border-[3px] border-ink bg-white/65 px-4 py-4 text-sm leading-7 text-ink/78 shadow-[5px_5px_0_var(--ink)]"
                }
              >
                {requestState.message}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>
            </form>

            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 underline decoration-[3px] underline-offset-4"
              >
                Back to login
              </Link>
              <span className="text-sm text-ink/45">/</span>
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 underline decoration-[3px] underline-offset-4"
              >
                Back to portfolio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
