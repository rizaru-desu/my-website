"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  testimonialSeedRecords,
  testimonialStatusValues,
  type TestimonialRecord,
  type TestimonialStatus,
} from "./testimonial.default-values";
import { TestimonialDetailDialog } from "./testimonial-detail-dialog";

function getStatusBadgeVariant(status: TestimonialStatus) {
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

function TestimonialEmptyState({
  label,
}: {
  label: string;
}) {
  return (
    <Card accent="cream" className="bg-white/75">
      <CardContent className="space-y-4">
        <Badge variant="yellow">Empty State</Badge>
        <CardTitle>No {label.toLowerCase()} testimonials right now.</CardTitle>
        <CardDescription>
          When new moderation activity lands in this state, it will appear here in the
          same structured review queue.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

type TestimonialListProps = {
  items: TestimonialRecord[];
  onApprove: (testimonial: TestimonialRecord) => void;
  onOpenDetails: (testimonial: TestimonialRecord) => void;
  onReject: (testimonial: TestimonialRecord) => void;
  onReopen: (testimonial: TestimonialRecord) => void;
  onToggleFeatured: (testimonial: TestimonialRecord) => void;
};

function TestimonialList({
  items,
  onApprove,
  onOpenDetails,
  onReject,
  onReopen,
  onToggleFeatured,
}: TestimonialListProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((testimonial, index) => (
        <Card
          key={testimonial.id}
          accent={index % 3 === 0 ? "cream" : index % 3 === 1 ? "blue" : "red"}
          className="space-y-4"
        >
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusBadgeVariant(testimonial.status)}>
                    {testimonial.status}
                  </Badge>
                  {testimonial.featured ? <Badge variant="red">Featured</Badge> : null}
                </div>
                <CardTitle>{testimonial.name}</CardTitle>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/60">
                  {testimonial.role} · {testimonial.company}
                </p>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">
                {renderStars(testimonial.rating)}
              </span>
            </div>

            <p className="text-sm leading-7 text-ink/78">{testimonial.message}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenDetails(testimonial)}>
                Review
              </Button>
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
                <Button type="button" variant="muted" onClick={() => onReopen(testimonial)}>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TestimonialsCms() {
  const [items, setItems] = useState(testimonialSeedRecords);
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialRecord | null>(
    null,
  );

  const counts = useMemo(
    () => ({
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
      featured: items.filter((item) => item.featured).length,
    }),
    [items],
  );

  function updateTestimonial(
    testimonial: TestimonialRecord,
    nextValues: Partial<TestimonialRecord>,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === testimonial.id
          ? {
              ...item,
              ...nextValues,
            }
          : item,
      ),
    );
    setSelectedTestimonial((current) =>
      current?.id === testimonial.id
        ? {
            ...current,
            ...nextValues,
          }
        : current,
    );
  }

  const pendingItems = items.filter((item) => item.status === "pending");
  const approvedItems = items.filter((item) => item.status === "approved");
  const rejectedItems = items.filter((item) => item.status === "rejected");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/75">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Pending Queue
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {counts.pending}
            </p>
          </CardContent>
        </Card>
        <Card accent="blue">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Approved
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {counts.approved}
            </p>
          </CardContent>
        </Card>
        <Card accent="red">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Rejected
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {counts.rejected}
            </p>
          </CardContent>
        </Card>
        <Card accent="cream">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Featured
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {counts.featured}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Badge variant="cream">Moderation Queue</Badge>
            <CardTitle>Review incoming testimonials before they go public.</CardTitle>
            <CardDescription>
              The queue is split by moderation status so pending review, approved proof,
              and rejected notes stay easy to scan without turning into a generic inbox.
            </CardDescription>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending {counts.pending}</TabsTrigger>
              <TabsTrigger value="approved">Approved {counts.approved}</TabsTrigger>
              <TabsTrigger value="rejected">Rejected {counts.rejected}</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingItems.length === 0 ? (
                <TestimonialEmptyState label="Pending" />
              ) : (
                <TestimonialList
                  items={pendingItems}
                  onApprove={(testimonial) =>
                    updateTestimonial(testimonial, { status: "approved" })
                  }
                  onOpenDetails={setSelectedTestimonial}
                  onReject={(testimonial) =>
                    updateTestimonial(testimonial, { status: "rejected" })
                  }
                  onReopen={(testimonial) =>
                    updateTestimonial(testimonial, { status: "pending" })
                  }
                  onToggleFeatured={(testimonial) =>
                    updateTestimonial(testimonial, { featured: !testimonial.featured })
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedItems.length === 0 ? (
                <TestimonialEmptyState label="Approved" />
              ) : (
                <TestimonialList
                  items={approvedItems}
                  onApprove={(testimonial) =>
                    updateTestimonial(testimonial, { status: "approved" })
                  }
                  onOpenDetails={setSelectedTestimonial}
                  onReject={(testimonial) =>
                    updateTestimonial(testimonial, { status: "rejected" })
                  }
                  onReopen={(testimonial) =>
                    updateTestimonial(testimonial, { status: "pending" })
                  }
                  onToggleFeatured={(testimonial) =>
                    updateTestimonial(testimonial, { featured: !testimonial.featured })
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedItems.length === 0 ? (
                <TestimonialEmptyState label="Rejected" />
              ) : (
                <TestimonialList
                  items={rejectedItems}
                  onApprove={(testimonial) =>
                    updateTestimonial(testimonial, { status: "approved" })
                  }
                  onOpenDetails={setSelectedTestimonial}
                  onReject={(testimonial) =>
                    updateTestimonial(testimonial, { status: "rejected" })
                  }
                  onReopen={(testimonial) =>
                    updateTestimonial(testimonial, { status: "pending" })
                  }
                  onToggleFeatured={(testimonial) =>
                    updateTestimonial(testimonial, { featured: !testimonial.featured })
                  }
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TestimonialDetailDialog
        open={Boolean(selectedTestimonial)}
        testimonial={selectedTestimonial}
        onClose={() => setSelectedTestimonial(null)}
        onApprove={(testimonial) => updateTestimonial(testimonial, { status: "approved" })}
        onReject={(testimonial) => updateTestimonial(testimonial, { status: "rejected" })}
        onReopen={(testimonial) => updateTestimonial(testimonial, { status: "pending" })}
        onToggleFeatured={(testimonial) =>
          updateTestimonial(testimonial, { featured: !testimonial.featured })
        }
      />
    </div>
  );
}
