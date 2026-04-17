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
import {
  formatTestimonialDate,
  getTestimonialRelationLabel,
  getTestimonialStatusLabel,
  renderTestimonialStars,
  type AdminTestimonialRecord,
} from "@/lib/testimonials.shared";

function getStatusBadgeVariant(status: AdminTestimonialRecord["status"]) {
  if (status === "APPROVED") {
    return "blue";
  }

  if (status === "REJECTED") {
    return "red";
  }

  return "yellow";
}

type TestimonialDetailDialogProps = {
  onApprove: (testimonial: AdminTestimonialRecord) => void;
  onClose: () => void;
  onReject: (testimonial: AdminTestimonialRecord) => void;
  onReopen: (testimonial: AdminTestimonialRecord) => void;
  onToggleFeatured: (testimonial: AdminTestimonialRecord) => void;
  open: boolean;
  testimonial: AdminTestimonialRecord | null;
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
                  {getTestimonialStatusLabel(testimonial.status)}
                </Badge>
                {testimonial.featured ? <Badge variant="red">Featured</Badge> : null}
                <Badge variant="cream">
                  {getTestimonialRelationLabel(testimonial.relation)}
                </Badge>
              </div>
              <DialogTitle>{testimonial.name}</DialogTitle>
              <DialogDescription>
                {testimonial.company
                  ? `${testimonial.role} at ${testimonial.company}`
                  : testimonial.role}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Rating
                  </p>
                  <p className="mt-2 font-display text-3xl uppercase leading-none text-ink">
                    {renderTestimonialStars(testimonial.rating)}
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
                    Submitted
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink/72">
                    {formatTestimonialDate(testimonial.createdAt)}
                  </p>
                </div>
                <div className="rounded-[22px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Reviewed
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink/72">
                    {testimonial.reviewedAt
                      ? formatTestimonialDate(testimonial.reviewedAt)
                      : "Not yet"}
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
                {testimonial.status !== "APPROVED" ? (
                  <Button type="button" variant="blue" onClick={() => onApprove(testimonial)}>
                    Approve
                  </Button>
                ) : null}
                {testimonial.status !== "REJECTED" ? (
                  <Button type="button" variant="default" onClick={() => onReject(testimonial)}>
                    Reject
                  </Button>
                ) : null}
                {testimonial.status !== "PENDING" ? (
                  <Button type="button" variant="outline" onClick={() => onReopen(testimonial)}>
                    Reopen
                  </Button>
                ) : null}
                {testimonial.status === "APPROVED" ? (
                  <Button
                    type="button"
                    variant={testimonial.featured ? "ink" : "muted"}
                    onClick={() => onToggleFeatured(testimonial)}
                  >
                    {testimonial.featured ? "Unfeature" : "Feature"}
                  </Button>
                ) : null}
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
