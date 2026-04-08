import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

import { AccountSettingsPanel } from "./account-settings-panel";

export default async function AdminAccountPage() {
  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-4">
            <Badge variant="blue">Account Settings</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Separate the public profile from the actual login identity.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-ink/80">
              This page is for the login identity behind the workspace: account
              detail, email and password changes, delete-account confirmation,
              and two-factor security. It keeps security work isolated from the
              public-facing profile editor.
            </p>
          </div>
          <Link href="/admin/profile" className="button-link">
            Open Profile Editor
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <EditorialCard className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Account Surface
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Live session identity
          </p>
        </EditorialCard>
        <EditorialCard accent="blue" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Security
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Account controls
          </p>
        </EditorialCard>
        <EditorialCard accent="red" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Route Protection
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Session-gated admin access
          </p>
        </EditorialCard>
      </div>

      <div className="space-y-3">
        <Badge variant="cream">Security Management</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Update the account, protect the studio, and keep dangerous actions
          contained.
        </h2>
      </div>

      <AccountSettingsPanel />
    </div>
  );
}
