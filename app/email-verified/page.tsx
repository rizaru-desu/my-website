import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function getSafeRedirectPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/login";
  }

  return value;
}

function getErrorMessage(error: string | undefined) {
  if (!error) {
    return null;
  }

  if (error === "TOKEN_EXPIRED") {
    return "This verification link has expired. Request a fresh email verification link and try again.";
  }

  if (error === "INVALID_TOKEN") {
    return "This verification link is invalid. Request a new verification email before signing in again.";
  }

  if (error === "USER_NOT_FOUND") {
    return "We could not match this verification link to an account.";
  }

  return "The verification link could not be completed.";
}

export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
}) {
  const { error, redirectTo } = await searchParams;
  const resolvedRedirect = getSafeRedirectPath(redirectTo);
  const errorMessage = getErrorMessage(error);
  const isSuccess = !errorMessage;

  return (
    <div className="px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant={isSuccess ? "blue" : "red"}>
            {isSuccess ? "Email Verified" : "Verification Failed"}
          </Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              {isSuccess ? "Verification Complete" : "Verification Error"}
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              {isSuccess
                ? "Your email is ready to use."
                : "This verification link could not be completed."}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              {isSuccess
                ? "The verification link confirmed your email successfully. You can return to sign in and continue to your account."
                : errorMessage}
            </p>
          </div>

          <Card accent={isSuccess ? "blue" : "red"} className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What happens next</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                {isSuccess ? (
                  <>
                    <p>1. Your email address has been verified.</p>
                    <p>2. You can return to sign in with the same account.</p>
                    <p>3. If another security step is enabled, it will continue after login.</p>
                  </>
                ) : (
                  <>
                    <p>1. Return to the login page.</p>
                    <p>2. Request a new verification email if needed.</p>
                    <p>3. Open the latest link and try again.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="paper-grid px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant={isSuccess ? "red" : "yellow"}>
                {isSuccess ? "Verified" : "Needs Attention"}
              </Badge>
              <CardTitle>
                {isSuccess
                  ? "The verification flow is finished."
                  : "A fresh verification step is needed."}
              </CardTitle>
              <CardDescription>
                {isSuccess
                  ? "If you opened the link in the same browser you use to sign in, continue back to login and finish signing in."
                  : "This can happen when a link is stale, incomplete, or already used. Returning to login will let you request another email."}
              </CardDescription>
            </div>

            <Separator />

            <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
              <p className="text-sm leading-7 text-ink/78">
                {isSuccess
                  ? "Need to continue to a protected page after signing in? Use the normal login flow and you will be routed to the next destination from there."
                  : "If the problem keeps happening, request a new verification email from the login page and use the most recent message in your inbox."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Go to Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={resolvedRedirect}>Continue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
