import Link from "next/link";

import { TestimonialSection } from "@/components/testimonial-section";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { PageHero } from "@/components/ui/page-hero";

export default function TestimonialsPage() {
  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          label="Testimonials"
          title="Leave a recommendation that can join the proof deck."
          description="This page is dedicated to testimonial submissions, so the request feels clear, focused, and easy to share directly with collaborators, clients, or recruiters."
        >
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="button-link">
              Back Home
            </Link>
            <Link href="/projects" className="button-link button-link-blue">
              Review Work First
            </Link>
          </div>
        </PageHero>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <EditorialCard accent="red" className="space-y-5">
              <Badge variant="red">Before You Submit</Badge>
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                Strong testimonials are specific, credible, and easy to verify.
              </h2>
              <p className="text-sm leading-7 text-ink/78">
                The best submissions mention what the collaboration felt like, what
                stood out, and why the recommendation would matter to a recruiter or
                partner reading this portfolio.
              </p>
            </EditorialCard>

            <div className="grid gap-4 sm:grid-cols-2">
              <EditorialCard accent="cream" className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  Review Flow
                </p>
                <p className="font-display text-2xl uppercase leading-none text-ink">
                  Submitted, reviewed, then featured
                </p>
                <p className="text-sm leading-7 text-ink/76">
                  Nothing appears instantly. Every testimonial goes through moderation
                  before it can become public proof.
                </p>
              </EditorialCard>

              <EditorialCard accent="blue" className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  Best Inputs
                </p>
                <p className="font-display text-2xl uppercase leading-none text-ink">
                  Outcome, collaboration, trust
                </p>
                <p className="text-sm leading-7 text-ink/76">
                  Short, concrete notes usually land better than generic praise.
                  Clear language makes moderation faster too.
                </p>
              </EditorialCard>
            </div>
          </div>

          <TestimonialSection />
        </section>
      </div>
    </div>
  );
}
