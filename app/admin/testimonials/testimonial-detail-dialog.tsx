"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { TestimonialRecord } from "./testimonial.default-values";

function getStatusBadgeVariant(status: TestimonialRecord["status"]) {
  if (status === "approved") {
    return "blue";
  }

  if (status === "rejected") {
    return "red";
  }

  return "yellow";
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

type TestimonialDetailDialogProps = {
  onApprove: (testimonial: TestimonialRecord) => void;
  onClose: () => void;
  onReject: (testimonial: TestimonialRecord) => void;
  onReopen: (testimonial: TestimonialRecord) => void;
  onToggleFeatured: (testimonial: TestimonialRecord) => void;
  open: boolean;
  testimonial: TestimonialRecord | null;
};

export function TestimonialDetailDialog({
  onApprove,
  onClose,
  onReject,
  onReopen,
  onToggleFeatured,
  open,
  testimonial,
}: TestimonialDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-3xl">
        {testimonial ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap gap-3">
                <Badge variant={getStatusBadgeVariant(testimonial.status)}>
                  {testimonial.status}
                </Badge>
                {testimonial.featured ? <Badge variant="red">Featured</Badge> : null}
              </div>
              <DialogTitle>{testimonial.name}</DialogTitle>
              <DialogDescription>
                {testimonial.role} at {testimonial.company} submitted on {testimonial.submittedAt}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[22px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Rating
                  </p>
                  <p className="mt-2 font-display text-3xl uppercase leading-none text-ink">
                    {renderStars(testimonial.rating)}
                  </p>
                </div>
                <div className="rounded-[22px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Role
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink/72">
                    {testimonial.role}
                  </p>
                </div>
                <div className="rounded-[22px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Company
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink/72">
                    {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="rounded-[26px] border-[3px] border-ink bg-white/70 px-5 py-5 shadow-[6px_6px_0_var(--ink)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                  Message
                </p>
                <p className="mt-3 text-base leading-8 text-ink/78">
                  {testimonial.message}
                </p>
              </div>
            </div>

            <DialogFooter className="justify-between">
              <div className="flex flex-wrap gap-3">
                {testimonial.status !== "approved" ? (
                  <Button type="button" variant="blue" onClick={() => onApprove(testimonial)}>
                    Approve
                  </Button>
                ) : null}
                {testimonial.status !== "rejected" ? (
                  <Button type="button" variant="default" onClick={() => onReject(testimonial)}>
                    Reject
                  </Button>
                ) : null}
                {testimonial.status !== "pending" ? (
                  <Button type="button" variant="outline" onClick={() => onReopen(testimonial)}>
                    Reopen
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={testimonial.featured ? "ink" : "muted"}
                  onClick={() => onToggleFeatured(testimonial)}
                >
                  {testimonial.featured ? "Unfeature" : "Feature"}
                </Button>
              </div>
              <Button type="button" variant="muted" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
