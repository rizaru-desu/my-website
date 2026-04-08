"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

type LoginState =
  | { tone: "idle"; message: string }
  | { tone: "error"; message: string }
  | { tone: "success"; message: string };

const idleState: LoginState = {
  tone: "idle",
  message:
    "Use your account email and password. If two-step verification is enabled, the next step will continue on the verification screen.",
};

function isEmailNotVerifiedMessage(message: string) {
  return message.trim().toLowerCase() === "email not verified";
}

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function getVerificationCallbackPath(redirectTo: string) {
  if (redirectTo === "/admin") {
    return "/email-verified";
  }

  return `/email-verified?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [loginState, setLoginState] = useState<LoginState>(idleState);
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));
  const verificationCallbackPath = getVerificationCallbackPath(redirectTo);

  useEffect(() => {
    if (!isSessionPending && session) {
      router.replace(redirectTo);
    }
  }, [isSessionPending, redirectTo, router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setLoginState({
      tone: "idle",
      message: "Checking your credentials and preparing your session...",
    });

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: redirectTo,
        rememberMe,
      },
      {
        onSuccess: (context) => {
          if (context.data?.twoFactorRedirect) {
            setLoginState({
              tone: "success",
              message:
                "Primary credentials accepted. Continue with your second-factor verification on the next screen.",
            });
            setIsSubmitting(false);
            return;
          }

        setLoginState({
          tone: "success",
          message: "Sign-in successful. Redirecting you now.",
        });

          startTransition(() => {
            router.push(redirectTo);
          });
          setIsSubmitting(false);
        },
        onError: (context) => {
          const nextMessage =
            typeof context.error.message === "string" && context.error.message
              ? context.error.message
              : "Unable to sign in with those credentials right now.";

          if (isEmailNotVerifiedMessage(nextMessage)) {
            setVerificationEmail(email.trim().toLowerCase());
            setIsVerificationDialogOpen(true);
          }

          setLoginState({
            tone: "error",
            message: nextMessage,
          });
          setIsSubmitting(false);
        },
      },
    );
  }

  async function handleResendVerificationEmail() {
    if (!verificationEmail) {
      setLoginState({
        tone: "error",
        message: "Enter your email address before requesting another verification link.",
      });
      return;
    }

    setIsResendingVerification(true);

    try {
      await authClient.sendVerificationEmail({
        email: verificationEmail,
        callbackURL: verificationCallbackPath,
      });

      setLoginState({
        tone: "success",
        message:
          "Verification email sent. Check your inbox and open the latest verification link before signing in again.",
      });
      setIsVerificationDialogOpen(false);
    } catch (error) {
      setLoginState({
        tone: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to resend the verification email right now.",
      });
    } finally {
      setIsResendingVerification(false);
    }
  }

  return (
    <div className="px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <Badge variant="yellow">Email Verification</Badge>
            <DialogTitle>Verify your email before signing in</DialogTitle>
            <DialogDescription>
              This account still needs email verification. Request a fresh verification
              link for <strong>{verificationEmail || "your account"}</strong>, then open
              it and return to login once the email is confirmed.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 rounded-[24px] border-[3px] border-ink bg-white/75 px-4 py-4 text-sm leading-7 text-ink/78 shadow-[5px_5px_0_var(--ink)]">
            Email and password access stays locked until the verification step is
            completed.
          </div>

          <DialogFooter>
            <DialogClose disabled={isResendingVerification}>Close</DialogClose>
            <Button
              type="button"
              variant="blue"
              disabled={isResendingVerification}
              onClick={() => {
                void handleResendVerificationEmail();
              }}
            >
              {isResendingVerification ? "Sending Link..." : "Resend Verification Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="blue">Studio Entry</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Secure Sign-In
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Sign in to your account.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              This entry page keeps the same design language as the public portfolio,
              with a more focused layout for secure access.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What happens next</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>1. Enter your email and password.</p>
                <p>2. Choose whether this browser should stay remembered.</p>
                <p>3. Continue to your account, or complete a second verification step if required.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-panel/95 px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Login</Badge>
              <CardTitle>Account access</CardTitle>
              <CardDescription>
                Sign in with your account email and password to continue.
              </CardDescription>
            </div>

            <Separator />

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                >
                  Email
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

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70 underline decoration-[3px] underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-3 shadow-[5px_5px_0_var(--ink)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-5 w-5 rounded border-[3px] border-ink accent-accent-blue"
                />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/72">
                  Remember me
                </span>
              </label>

              <div
                className={
                  loginState.tone === "success"
                    ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                    : loginState.tone === "error"
                      ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                      : "rounded-[24px] border-[3px] border-ink bg-white/65 px-4 py-4 text-sm leading-7 text-ink/78 shadow-[5px_5px_0_var(--ink)]"
                }
              >
                {loginState.message}
              </div>

              <div className="space-y-4 pt-2">
                <Button type="submit" variant="default" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                <p className="text-sm leading-7 text-ink/65">
                  Keep this checked if you want the session to stay active on this
                  browser after closing and reopening it.
                </p>
              </div>
            </form>

            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 underline decoration-[3px] underline-offset-4"
              >
                Back to portfolio
              </Link>
              <span className="text-sm text-ink/45">/</span>
              <Link
                href="/admin"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 underline decoration-[3px] underline-offset-4"
              >
                Open dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
