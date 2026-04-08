import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountDeletedPage() {
  return (
    <div className="px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="red">Account Deleted</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Confirmation Complete
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Your account has been permanently removed.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              The email confirmation link finished the deletion flow. This
              account, its sessions, and related sign-in records are no longer
              active.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What just happened</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>1. Your deletion request was confirmed from the email link.</p>
                <p>2. The account was removed and its sessions were ended.</p>
                <p>3. You can return to the portfolio or sign in with another account.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="paper-grid px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="blue">Account Closed</Badge>
              <CardTitle>The access for this account is closed.</CardTitle>
              <CardDescription>
                If this deletion was intentional, there is nothing else you need
                to do here. If you still manage the site with another account,
                you can go back to the login screen.
              </CardDescription>
            </div>

            <Separator />

            <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
              <p className="text-sm leading-7 text-ink/78">
                Need access again later? Create a new account or ask an
                administrator to provision one. Deleted accounts cannot be
                restored from this flow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Go to Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Back to Portfolio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
