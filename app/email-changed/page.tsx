import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function EmailChangedPage() {
  return (
    <div className="px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="space-y-6">
          <Badge variant="blue">Email Updated</Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/60">
              Verification Complete
            </p>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Your login email has been changed.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/78 sm:text-lg">
              The verification link confirmed the new address successfully. This
              account now uses the updated email.
            </p>
          </div>

          <Card accent="blue" className="space-y-4">
            <CardContent className="space-y-4">
              <Badge variant="cream">What changed</Badge>
              <div className="space-y-3 text-sm leading-7 text-ink/78">
                <p>1. The new email address has been verified.</p>
                <p>2. Your account now uses that address for future sign-ins.</p>
                <p>3. You can return to the account panel or sign in again if needed.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="paper-grid px-6 py-7 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Update Complete</Badge>
              <CardTitle>The email-change flow is finished.</CardTitle>
              <CardDescription>
                If this verification happened in the same browser you use for
                the account, you can go back to settings. Otherwise, sign in
                with the new email address from the login page.
              </CardDescription>
            </div>

            <Separator />

            <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
              <p className="text-sm leading-7 text-ink/78">
                Keep using the previous email only if you have not completed the
                verification link. Once verified, the new address becomes the
                active login identity for this account.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/admin/account">Back to Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
