import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PasswordResetCompletePage() {
  return (
    <div className="px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="blue">Password Updated</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Reset Complete
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Your password has been reset.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              The reset form accepted your new password. You can now return to
              the login page and sign in with the updated credential.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What changed</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>1. The old password is no longer valid.</p>
                <p>2. The new password is now active for this account.</p>
                <p>3. Existing sessions may be signed out depending on security settings.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="paper-grid px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Next Step</Badge>
              <CardTitle>Sign in again with the new password.</CardTitle>
              <CardDescription>
                If you opened the reset link on another device, just return to
                the login page anywhere and use the updated password there.
              </CardDescription>
            </div>

            <Separator />

            <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
              <p className="text-sm leading-7 text-ink/78">
                Need another reset? You can always request a fresh recovery link
                if this new password is forgotten later.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Go to Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/forgot-password">Request Another Reset</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
