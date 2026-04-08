"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

type ResetPasswordState =
  | { tone: "idle"; message: string }
  | { tone: "error"; message: string }
  | { tone: "success"; message: string };

function getResetState(error: string | null, token: string | null): ResetPasswordState {
  if (error === "INVALID_TOKEN") {
    return {
      tone: "error",
      message:
        "This reset link is invalid or expired. Request a new password reset email and try again.",
    };
  }

  if (!token) {
    return {
      tone: "error",
      message:
        "The reset token is missing. Open the link from your email again or request a fresh reset message.",
    };
  }

  return {
    tone: "idle",
    message:
      "Choose a new password for the account tied to this reset link. After success, you will be redirected to the completion page.",
  };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const initialState = useMemo(
    () => getResetState(error, token),
    [error, token],
  );
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetState, setResetState] = useState<ResetPasswordState>(initialState);

  useEffect(() => {
    setResetState(initialState);
  }, [initialState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setResetState({
        tone: "error",
        message:
          "The reset token is missing. Request a new reset email before trying again.",
      });
      return;
    }

    if (!nextPassword.trim() || !confirmPassword.trim()) {
      setResetState({
        tone: "error",
        message: "Enter the new password and its confirmation first.",
      });
      return;
    }

    if (nextPassword.length < 8) {
      setResetState({
        tone: "error",
        message: "Use at least 8 characters for the new password.",
      });
      return;
    }

    if (nextPassword !== confirmPassword) {
      setResetState({
        tone: "error",
        message: "The password confirmation does not match yet.",
      });
      return;
    }

    setIsSubmitting(true);
    setResetState({
      tone: "idle",
      message: "Resetting the password and securing the account...",
    });

    const result = await authClient.resetPassword({
      token,
      newPassword: nextPassword,
    });

    setIsSubmitting(false);

    if (result.error) {
      setResetState({
        tone: "error",
        message:
          typeof result.error.message === "string" && result.error.message
            ? result.error.message
            : "Unable to reset the password right now.",
      });
      return;
    }

    setResetState({
      tone: "success",
      message: "Password reset complete. Redirecting to the completion page now.",
    });
    setNextPassword("");
    setConfirmPassword("");
    router.push("/password-reset-complete");
  }

  const hasUsableToken = Boolean(token) && error !== "INVALID_TOKEN";

  return (
    <div className="px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="blue">Reset Password</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Password Reset
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Set a new password from the email link.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              This page opens from the password reset email. A valid link adds
              a secure token to the URL so the new password can be applied
              safely.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">Token status</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>
                  {token
                    ? "Reset token detected from the email link."
                    : "No reset token found in the current URL."}
                </p>
                <p>
                  {error === "INVALID_TOKEN"
                    ? "This token is invalid or expired."
                    : "If the link is valid, submitting this form will replace the old password."}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-panel/95 px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">New Password</Badge>
              <CardTitle>Complete the reset flow</CardTitle>
              <CardDescription>
                After this succeeds, the previous password stops working and the
                account can sign in with the new one.
              </CardDescription>
            </div>

            <Separator />

            {hasUsableToken ? (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="next-password"
                    className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                  >
                    New password
                  </label>
                  <Input
                    id="next-password"
                    type="password"
                    value={nextPassword}
                    onChange={(event) => setNextPassword(event.target.value)}
                    placeholder="Enter a new password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat the new password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                </div>

                <div
                  className={
                    resetState.tone === "success"
                      ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                      : resetState.tone === "error"
                        ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                        : "rounded-[24px] border-[3px] border-ink bg-white/65 px-4 py-4 text-sm leading-7 text-ink/78 shadow-[5px_5px_0_var(--ink)]"
                  }
                >
                  {resetState.message}
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting Password..." : "Save New Password"}
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]">
                  {resetState.message}
                </div>
                <div className="rounded-[24px] border-[3px] border-dashed border-ink/30 bg-white/60 px-4 py-4 text-sm leading-7 text-ink/72">
                  The reset form stays hidden until you open a valid reset link
                  with a `token` in the URL.
                </div>
              </div>
            )}

            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 underline decoration-[3px] underline-offset-4"
              >
                Request new link
              </Link>
              <span className="text-sm text-ink/45">/</span>
              <Link
                href="/login"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 underline decoration-[3px] underline-offset-4"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
