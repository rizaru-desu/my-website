import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import {
  AdminTestimonialsAccessError,
  getAdminTestimonialsContext,
} from "@/lib/testimonials";

import { TestimonialsCms } from "./testimonials-cms";

export default async function AdminTestimonialsPage() {
  const requestHeaders = await headers();
  try {
    await getAdminTestimonialsContext(requestHeaders);
  } catch (error) {
    if (error instanceof AdminTestimonialsAccessError && error.status === 401) {
      redirect("/login?redirectTo=%2Fadmin%2Ftestimonials");
    }

    redirect("/admin");
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-4">
            <Badge variant="blue">Testimonials Manager</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Moderate social proof with the same editorial discipline as the portfolio.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-ink/80">
              Keep pending submissions, approved quotes, and rejected notes clearly
              separated so testimonial moderation feels structured instead of reactive.
            </p>
          </div>
          <Link href="/" className="button-link button-link-blue">
            View Public Proof
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <EditorialCard className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Review Mode
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Pending / Approved / Rejected
          </p>
        </EditorialCard>
        <EditorialCard accent="blue" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Detail View
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Moderator Dialog
          </p>
        </EditorialCard>
        <EditorialCard accent="red" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Actions
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Approve, reject, reopen, feature
          </p>
        </EditorialCard>
      </div>

      <div className="space-y-3">
        <Badge variant="cream">Proof Moderation</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Review each quote before it becomes recruiter-facing proof.
        </h2>
      </div>

      <TestimonialsCms />
    </div>
  );
}
