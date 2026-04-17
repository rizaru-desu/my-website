import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { AdminProfileAccessError, getAdminProfileContext } from "@/lib/profile";

import { ProfileForm } from "./profile-form";

export default async function AdminProfilePage() {
  const requestHeaders = await headers();

  try {
    await getAdminProfileContext(requestHeaders);
  } catch (error) {
    if (error instanceof AdminProfileAccessError && error.status === 401) {
      redirect("/login?redirectTo=%2Fadmin%2Fprofile");
    }

    redirect("/admin");
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div className="space-y-4">
            <Badge variant="blue">Profile Editor</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Shape the voice of the portfolio.
            </h1>
            <p className="text-base leading-8 text-ink/78">
              This area manages the public introduction, availability, role
              framing, and resume-facing identity details that appear across
              multiple routes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <EditorialCard className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Validation Layer
              </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Structured Validation
              </p>
            </EditorialCard>
            <EditorialCard accent="red" className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Access Scope
              </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Architect Only
              </p>
            </EditorialCard>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <Badge variant="cream">Editable Fields</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Profile content, CTA copy, and social links in one structured editor.
        </h2>
      </div>

      <ProfileForm />
    </div>
  );
}
