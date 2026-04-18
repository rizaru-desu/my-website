"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

type SubmissionState =
  | { tone: "idle"; message: string }
  | { tone: "success"; message: string }
  | { tone: "error"; message: string };

const idleState: SubmissionState = {
  tone: "idle",
  message:
    "This screen verifies the second step. Use your authenticator app code or one of the backup codes generated during setup.",
};

export default function TwoFactorPage() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(idleState);

  function navigateAfterVerification() {
    window.location.replace("/admin");
  }

  useEffect(() => {
    if (!isSessionPending && session) {
      navigateAfterVerification();
    }
  }, [isSessionPending, session]);

  function getErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message) {
        return message;
      }
    }

    return fallback;
  }

  async function handleAuthenticatorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCode = authenticatorCode.trim();

    if (trimmedCode.length < 6) {
      setSubmissionState({
        tone: "error",
        message:
          "Enter a full authenticator code first.",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await authClient.twoFactor.verifyTotp({
      code: trimmedCode,
      trustDevice,
    });
    setIsSubmitting(false);

    if (result.error) {
      setSubmissionState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to verify the authenticator code right now.",
        ),
      });
      return;
    }

    setSubmissionState({
      tone: "success",
      message: "Authenticator code accepted. Redirecting you now.",
    });
    navigateAfterVerification();
  }

  async function handleBackupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCode = backupCode.trim();

    if (trimmedCode.length < 8) {
      setSubmissionState({
        tone: "error",
        message:
          "Enter a backup code first.",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await authClient.twoFactor.verifyBackupCode({
      code: trimmedCode,
      trustDevice,
    });
    setIsSubmitting(false);

    if (result.error) {
      setSubmissionState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to verify the backup code right now.",
        ),
      });
      return;
    }

    setSubmissionState({
      tone: "success",
      message: "Backup code accepted. Redirecting you now.",
    });
    navigateAfterVerification();
  }

  return (
    <div className="px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="blue">2FA Checkpoint</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Two-Factor Verification
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Verify your access.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              This screen keeps the same visual style as the login page while
              handling authenticator and backup-code verification.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What happens here</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>1. Your primary email and password were already accepted.</p>
                <p>2. Use your authenticator app code or a saved backup code.</p>
                <p>3. Optionally trust this device so you skip the checkpoint next time.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-panel/95 px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Verification</Badge>
              <CardTitle>Second factor confirmation</CardTitle>
              <CardDescription>
                Finish the sign-in process without leaving this screen.
              </CardDescription>
            </div>

            <Separator />

            <Tabs defaultValue="authenticator">
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="authenticator">
                  Authenticator Code
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="backup">
                  Backup Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="authenticator">
                <form className="space-y-5" onSubmit={handleAuthenticatorSubmit}>
                  <div className="space-y-2">
                    <label
                      htmlFor="authenticator-code"
                      className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                    >
                      Authenticator code
                    </label>
                    <Input
                      id="authenticator-code"
                      type="text"
                      inputMode="numeric"
                      value={authenticatorCode}
                      onChange={(event) =>
                        setAuthenticatorCode(event.target.value.replace(/\s+/g, ""))
                      }
                      placeholder="123456"
                      autoComplete="one-time-code"
                      maxLength={8}
                      required
                    />
                    <p className="text-sm leading-7 text-ink/65">
                      Use the 6-digit code from your authenticator app to
                      finish sign-in.
                    </p>
                  </div>

                  <label className="flex items-center gap-3 rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-3 shadow-[5px_5px_0_var(--ink)]">
                    <input
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(event) => setTrustDevice(event.target.checked)}
                      className="h-5 w-5 rounded border-[3px] border-ink accent-accent-blue"
                    />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/72">
                      Trust this device
                    </span>
                  </label>

                  <div className="space-y-4 pt-2">
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="backup">
                <form className="space-y-5" onSubmit={handleBackupSubmit}>
                  <div className="space-y-2">
                    <label
                      htmlFor="backup-code"
                      className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
                    >
                      Backup code
                    </label>
                    <Input
                      id="backup-code"
                      type="text"
                      value={backupCode}
                      onChange={(event) => setBackupCode(event.target.value.toUpperCase())}
                      placeholder="ABCD-1234"
                      autoComplete="off"
                      required
                    />
                    <p className="text-sm leading-7 text-ink/65">
                      Use one of the recovery codes saved when two-factor was
                      enabled. Each code can be used once.
                    </p>
                  </div>

                  <label className="flex items-center gap-3 rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-3 shadow-[5px_5px_0_var(--ink)]">
                    <input
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(event) => setTrustDevice(event.target.checked)}
                      className="h-5 w-5 rounded border-[3px] border-ink accent-accent-blue"
                    />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/72">
                      Trust this device
                    </span>
                  </label>

                  <div className="space-y-4 pt-2">
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Verifying..." : "Verify Backup"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div
              className={
                submissionState.tone === "success"
                  ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                  : submissionState.tone === "error"
                    ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
                    : "rounded-[24px] border-[3px] border-ink bg-white/65 px-4 py-4 text-sm leading-7 text-ink/78 shadow-[5px_5px_0_var(--ink)]"
              }
            >
              {submissionState.message}
            </div>

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
