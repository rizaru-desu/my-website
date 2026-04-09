"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/ui/editorial-card";
import {
  formatPublicTestimonialRole,
  renderTestimonialStars,
  type PublicHomepageTestimonial,
} from "@/lib/testimonials.shared";

const carouselAccents = ["red", "blue", "cream", "blue"] as const;
const CARDS_PER_PAGE = 4;

type TestimonialCarouselProps = {
  testimonials: PublicHomepageTestimonial[];
};

function chunkTestimonials(testimonials: PublicHomepageTestimonial[]) {
  const pages: PublicHomepageTestimonial[][] = [];

  for (let index = 0; index < testimonials.length; index += CARDS_PER_PAGE) {
    pages.push(testimonials.slice(index, index + CARDS_PER_PAGE));
  }

  return pages;
}

function getAccent(index: number) {
  return carouselAccents[index % carouselAccents.length];
}

export function TestimonialCarousel({
  testimonials,
}: TestimonialCarouselProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pages = useMemo(() => chunkTestimonials(testimonials), [testimonials]);
  const activePage = pages[activePageIndex] ?? pages[0] ?? [];

  const showNextPage = useEffectEvent(() => {
    if (pages.length <= 1) {
      return;
    }

    startTransition(() => {
      setActivePageIndex((currentIndex) => (currentIndex + 1) % pages.length);
    });
  });

  const showPreviousPage = useEffectEvent(() => {
    if (pages.length <= 1) {
      return;
    }

    startTransition(() => {
      setActivePageIndex((currentIndex) =>
        currentIndex === 0 ? pages.length - 1 : currentIndex - 1,
      );
    });
  });

  useEffect(() => {
    if (pages.length <= 1 || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      showNextPage();
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [isPaused, pages.length, showNextPage]);

  if (testimonials.length === 0) {
    return (
      <EditorialCard accent="cream" className="space-y-4">
        <Badge variant="cream">Proof Queue</Badge>
        <h3 className="font-display text-3xl uppercase leading-none text-ink">
          More reviewed testimonials will appear here soon.
        </h3>
        <p className="text-sm leading-7 text-ink/76">
          Public proof only shows featured testimonials that already passed
          review.
        </p>
      </EditorialCard>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[30px] border-[3px] border-ink bg-[linear-gradient(180deg,#fff7de_0%,#fffdf4_100%)] px-5 py-5 shadow-[9px_9px_0_var(--ink)] sm:px-6 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="accent-plate right-5 top-5 hidden h-12 w-12 rotate-6 rounded-[14px] bg-accent-blue/90 lg:block" />
      <div className="accent-plate bottom-7 right-16 hidden h-6 w-24 -rotate-3 rounded-full bg-accent-red/85 lg:block" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant="cream">Proof Deck</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border-[3px] border-ink bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/60 shadow-[4px_4px_0_var(--ink)]">
              Page {activePageIndex + 1}/{pages.length}
            </div>

            {pages.length > 1 ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => showPreviousPage()}
                  aria-label="Show previous testimonial page"
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="blue"
                  size="sm"
                  onClick={() => showNextPage()}
                  aria-label="Show next testimonial page"
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div
          key={`testimonial-page-${activePageIndex}`}
          className="testimonial-stage-enter grid gap-4 md:grid-cols-2"
        >
          {activePage.map((testimonial, index) => (
            <EditorialCard
              key={testimonial.id}
              accent={getAccent(activePageIndex * CARDS_PER_PAGE + index)}
              className="flex min-h-[280px] flex-col gap-4 px-5 py-5 sm:min-h-[300px] sm:px-6 sm:py-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-[16px] border-[3px] border-ink bg-white/80 font-display text-3xl leading-none text-ink shadow-[4px_4px_0_var(--ink)]">
                    "
                  </span>
                  <div className="space-y-1">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/55">
                      Featured
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/65">
                      {renderTestimonialStars(testimonial.rating)}
                    </p>
                  </div>
                </div>

                <span className="rounded-full border-[3px] border-ink bg-white/75 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink/55 shadow-[3px_3px_0_var(--ink)]">
                  {activePageIndex * CARDS_PER_PAGE + index + 1}
                </span>
              </div>

              <p className="line-clamp-5 text-base leading-8 text-ink/80 sm:text-[1.02rem]">
                {testimonial.message}
              </p>

              <div className="mt-auto space-y-4 border-t-[3px] border-dashed border-ink/22 pt-4">
                <div className="space-y-2">
                  <p className="font-display text-3xl uppercase leading-none text-ink">
                    {testimonial.name}
                  </p>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                    {formatPublicTestimonialRole(testimonial)}
                  </p>
                </div>

                <div className="rounded-[18px] border-[3px] border-ink bg-white/80 px-4 py-3 shadow-[4px_4px_0_var(--ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                    Reading feel
                  </p>
                  <p className="mt-2 font-display text-xl uppercase leading-none text-ink">
                    Short. Sharp. Credible.
                  </p>
                </div>
              </div>
            </EditorialCard>
          ))}
        </div>

        {pages.length > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {pages.map((_, index) => (
                <button
                  key={`testimonial-page-indicator-${index}`}
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setActivePageIndex(index);
                    });
                  }}
                  className={`h-4 rounded-full border-[3px] border-ink transition-all duration-300 ${
                    index === activePageIndex
                      ? "w-14 bg-accent-red shadow-[4px_4px_0_var(--ink)]"
                      : "w-4 bg-white/80 shadow-[2px_2px_0_var(--ink)]"
                  }`}
                  aria-label={`Go to testimonial page ${index + 1}`}
                />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/52">
              {isPaused
                ? "Carousel paused for reading"
                : "Carousel auto-rotates by page"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
