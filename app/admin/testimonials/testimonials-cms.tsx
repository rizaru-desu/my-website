"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatTestimonialDate,
  getTestimonialRelationLabel,
  getTestimonialStatusLabel,
  renderTestimonialStars,
  type AdminTestimonialRecord,
  type TestimonialModerationAction,
  type TestimonialStatusValue,
} from "@/lib/testimonials.shared";

import { TestimonialDetailDialog } from "./testimonial-detail-dialog";
import {
  adminTestimonialsQueryKey,
  fetchAdminTestimonials,
  updateAdminTestimonialAction,
} from "./testimonials.queries";
import { TestimonialPagination } from "./testimonial-pagination";

type TestimonialTabValue = "PENDING" | "APPROVED" | "REJECTED";

type TestimonialFilterState = {
  featured: "all" | "featured-only" | "not-featured";
  relation: "all" | AdminTestimonialRecord["relation"];
  search: string;
};

type TestimonialPaginationState = Record<TestimonialTabValue, number>;

const defaultPaginationState: TestimonialPaginationState = {
  APPROVED: 1,
  PENDING: 1,
  REJECTED: 1,
};

function getStatusBadgeVariant(status: TestimonialStatusValue) {
  if (status === "APPROVED") {
    return "blue";
  }

  if (status === "REJECTED") {
    return "red";
  }

  return "yellow";
}

function TestimonialEmptyState({
  hasFilters,
  label,
}: {
  hasFilters: boolean;
  label: string;
}) {
  return (
    <Card accent="cream" className="bg-white/75">
      <CardContent className="space-y-4">
        <Badge variant="yellow">{hasFilters ? "No Results" : "Empty State"}</Badge>
        <CardTitle>
          {hasFilters
            ? `No ${label.toLowerCase()} testimonials match the current filters.`
            : `No ${label.toLowerCase()} testimonials right now.`}
        </CardTitle>
        <CardDescription>
          {hasFilters
            ? "Adjust the search, relation, or featured filter to reveal testimonial records again."
            : "When new moderation activity lands in this state, it will appear here in the same structured review queue."}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

type TestimonialListProps = {
  items: AdminTestimonialRecord[];
  isUpdatingId: string | null;
  onAction: (testimonial: AdminTestimonialRecord, action: TestimonialModerationAction) => void;
  onOpenDetails: (testimonial: AdminTestimonialRecord) => void;
};

function TestimonialList({
  items,
  isUpdatingId,
  onAction,
  onOpenDetails,
}: TestimonialListProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((testimonial, index) => {
        const isUpdating = isUpdatingId === testimonial.id;

        return (
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
                      {getTestimonialStatusLabel(testimonial.status)}
                    </Badge>
                    {testimonial.featured ? <Badge variant="red">Featured</Badge> : null}
                    <Badge variant="cream">
                      {getTestimonialRelationLabel(testimonial.relation)}
                    </Badge>
                  </div>
                  <CardTitle>{testimonial.name}</CardTitle>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/60">
                    {testimonial.company
                      ? `${testimonial.role} · ${testimonial.company}`
                      : testimonial.role}
                  </p>
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">
                  {renderTestimonialStars(testimonial.rating)}
                </span>
              </div>

              <p className="text-sm leading-7 text-ink/78">{testimonial.message}</p>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/52">
                Submitted {formatTestimonialDate(testimonial.createdAt)}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => onOpenDetails(testimonial)}
                >
                  Review
                </Button>
                {testimonial.status !== "APPROVED" ? (
                  <Button
                    type="button"
                    variant="blue"
                    disabled={isUpdating}
                    onClick={() => onAction(testimonial, "approve")}
                  >
                    Approve
                  </Button>
                ) : null}
                {testimonial.status !== "REJECTED" ? (
                  <Button
                    type="button"
                    variant="default"
                    disabled={isUpdating}
                    onClick={() => onAction(testimonial, "reject")}
                  >
                    Reject
                  </Button>
                ) : null}
                {testimonial.status !== "PENDING" ? (
                  <Button
                    type="button"
                    variant="muted"
                    disabled={isUpdating}
                    onClick={() => onAction(testimonial, "reopen")}
                  >
                    Reopen
                  </Button>
                ) : null}
                {testimonial.status === "APPROVED" ? (
                  <Button
                    type="button"
                    variant={testimonial.featured ? "ink" : "muted"}
                    disabled={isUpdating}
                    onClick={() => onAction(testimonial, "toggleFeatured")}
                  >
                    {testimonial.featured ? "Unfeature" : "Feature"}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function TestimonialsCms() {
  const queryClient = useQueryClient();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(4);
  const [filters, setFilters] = useState<TestimonialFilterState>({
    featured: "all",
    relation: "all",
    search: "",
  });
  const [pagination, setPagination] =
    useState<TestimonialPaginationState>(defaultPaginationState);

  const {
    data: items = [],
    error,
    isPending,
    isRefetching,
  } = useQuery({
    queryKey: adminTestimonialsQueryKey,
    queryFn: fetchAdminTestimonials,
  });

  const mutation = useMutation({
    mutationFn: updateAdminTestimonialAction,
    onMutate: () => {
      setFeedbackMessage(null);
    },
    onSuccess: async (result) => {
      setFeedbackMessage(result.message);
      await queryClient.invalidateQueries({ queryKey: adminTestimonialsQueryKey });
    },
    onError: (mutationError) => {
      setFeedbackMessage(
        mutationError instanceof Error
          ? mutationError.message
          : "The testimonial moderation action could not be completed.",
      );
    },
  });

  const counts = useMemo(
    () => ({
      approved: items.filter((item) => item.status === "APPROVED").length,
      featured: items.filter((item) => item.featured).length,
      pending: items.filter((item) => item.status === "PENDING").length,
      rejected: items.filter((item) => item.status === "REJECTED").length,
    }),
    [items],
  );

  const selectedTestimonial =
    items.find((item) => item.id === selectedTestimonialId) ?? null;

  const relationOptions = useMemo(
    () =>
      ["all", ...new Set(items.map((item) => item.relation))] as Array<
        "all" | AdminTestimonialRecord["relation"]
      >,
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = filters.search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.role.toLowerCase().includes(normalizedQuery) ||
        item.company?.toLowerCase().includes(normalizedQuery) ||
        item.message.toLowerCase().includes(normalizedQuery);

      const matchesRelation =
        filters.relation === "all" || item.relation === filters.relation;

      const matchesFeatured =
        filters.featured === "all" ||
        (filters.featured === "featured-only" && item.featured) ||
        (filters.featured === "not-featured" && !item.featured);

      return matchesQuery && matchesRelation && matchesFeatured;
    });
  }, [filters, items]);

  const pendingItems = filteredItems.filter((item) => item.status === "PENDING");
  const approvedItems = filteredItems.filter((item) => item.status === "APPROVED");
  const rejectedItems = filteredItems.filter((item) => item.status === "REJECTED");
  const hasFilters =
    filters.search.trim().length > 0 ||
    filters.relation !== "all" ||
    filters.featured !== "all";

  function handleAction(
    testimonial: AdminTestimonialRecord,
    action: TestimonialModerationAction,
  ) {
    mutation.mutate({
      action,
      id: testimonial.id,
    });
  }

  function resetPagination() {
    setPagination(defaultPaginationState);
  }

  function handleSearchChange(value: string) {
    setFilters((current) => ({
      ...current,
      search: value,
    }));
    resetPagination();
  }

  function handleRelationChange(value: "all" | AdminTestimonialRecord["relation"]) {
    setFilters((current) => ({
      ...current,
      relation: value,
    }));
    resetPagination();
  }

  function handleFeaturedChange(
    value: TestimonialFilterState["featured"],
  ) {
    setFilters((current) => ({
      ...current,
      featured: value,
    }));
    resetPagination();
  }

  function clearFilters() {
    setFilters({
      featured: "all",
      relation: "all",
      search: "",
    });
    resetPagination();
  }

  function getPaginatedItems(itemsByTab: AdminTestimonialRecord[], tab: TestimonialTabValue) {
    const pageCount = Math.max(1, Math.ceil(itemsByTab.length / pageSize));
    const requestedPage = pagination[tab];
    const currentPage = Math.min(requestedPage, pageCount);
    const startIndex = (currentPage - 1) * pageSize;

    return {
      currentPage,
      items: itemsByTab.slice(startIndex, startIndex + pageSize),
      pageCount,
      totalItems: itemsByTab.length,
    };
  }

  const paginatedPending = getPaginatedItems(pendingItems, "PENDING");
  const paginatedApproved = getPaginatedItems(approvedItems, "APPROVED");
  const paginatedRejected = getPaginatedItems(rejectedItems, "REJECTED");

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
            <CardTitle>Review, filter, and page through testimonials before they go public.</CardTitle>
            <CardDescription>
              The queue is split by moderation status so pending review, approved proof,
              and rejected notes stay easy to scan without turning into a generic inbox.
            </CardDescription>
          </div>

          <Separator />

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-2">
              <label
                htmlFor="testimonial-search"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
              >
                Search testimonials
              </label>
              <Input
                id="testimonial-search"
                value={filters.search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search by name, role, company, or quote"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                Featured filter
              </p>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["all", "All"],
                    ["featured-only", "Featured"],
                    ["not-featured", "Not Featured"],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={
                      filters.featured === value
                        ? value === "featured-only"
                          ? "default"
                          : value === "not-featured"
                            ? "blue"
                            : "outline"
                        : "muted"
                    }
                    onClick={() => handleFeaturedChange(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
              Relation filter
            </p>
            <div className="flex flex-wrap gap-3">
              {relationOptions.map((relation) => (
                <Button
                  key={relation}
                  type="button"
                  variant={
                    filters.relation === relation
                      ? relation === "CLIENT"
                        ? "default"
                        : relation === "COLLEAGUE"
                          ? "blue"
                          : relation === "MENTOR"
                            ? "outline"
                            : relation === "OTHER"
                              ? "muted"
                              : "outline"
                      : "muted"
                  }
                  onClick={() => handleRelationChange(relation)}
                >
                  {relation === "all" ? "all" : getTestimonialRelationLabel(relation)}
                </Button>
              ))}
            </div>
          </div>

          {hasFilters ? (
            <div className="flex flex-col gap-3 rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
                {filteredItems.length} testimonial{filteredItems.length === 1 ? "" : "s"} match the current filters.
              </p>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : null}

          {feedbackMessage ? (
            <div className="rounded-[22px] border-[3px] border-accent-blue bg-white px-4 py-3 text-sm font-semibold leading-6 text-accent-blue shadow-[5px_5px_0_var(--ink)]">
              {feedbackMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[22px] border-[3px] border-accent-red bg-white px-4 py-3 text-sm font-semibold leading-6 text-accent-red shadow-[5px_5px_0_var(--ink)]">
              {error instanceof Error
                ? error.message
                : "The testimonial queue could not be loaded right now."}
            </div>
          ) : null}

          {isPending ? (
            <Card accent="cream" className="bg-white/70">
              <CardContent className="space-y-4 text-center">
                <Badge variant="yellow">Loading</Badge>
                <CardTitle>Loading testimonial moderation.</CardTitle>
                <CardDescription>
                  Pulling the latest testimonial queue from the server.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="PENDING">
              <TabsList>
                <TabsTrigger value="PENDING">Pending {counts.pending}</TabsTrigger>
                <TabsTrigger value="APPROVED">Approved {counts.approved}</TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected {counts.rejected}</TabsTrigger>
              </TabsList>

              <TabsContent value="PENDING">
                {pendingItems.length === 0 ? (
                  <TestimonialEmptyState label="Pending" hasFilters={hasFilters} />
                ) : (
                  <div className="space-y-5">
                    <TestimonialList
                      items={paginatedPending.items}
                      isUpdatingId={mutation.isPending ? mutation.variables?.id ?? null : null}
                      onAction={handleAction}
                      onOpenDetails={(testimonial) => setSelectedTestimonialId(testimonial.id)}
                    />
                    <TestimonialPagination
                      currentPage={paginatedPending.currentPage}
                      onPageChange={(page) =>
                        setPagination((current) => ({ ...current, PENDING: page }))
                      }
                      onPageSizeChange={(nextPageSize) => {
                        setPageSize(nextPageSize);
                        resetPagination();
                      }}
                      pageCount={paginatedPending.pageCount}
                      pageSize={pageSize}
                      totalItems={paginatedPending.totalItems}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="APPROVED">
                {approvedItems.length === 0 ? (
                  <TestimonialEmptyState label="Approved" hasFilters={hasFilters} />
                ) : (
                  <div className="space-y-5">
                    <TestimonialList
                      items={paginatedApproved.items}
                      isUpdatingId={mutation.isPending ? mutation.variables?.id ?? null : null}
                      onAction={handleAction}
                      onOpenDetails={(testimonial) => setSelectedTestimonialId(testimonial.id)}
                    />
                    <TestimonialPagination
                      currentPage={paginatedApproved.currentPage}
                      onPageChange={(page) =>
                        setPagination((current) => ({ ...current, APPROVED: page }))
                      }
                      onPageSizeChange={(nextPageSize) => {
                        setPageSize(nextPageSize);
                        resetPagination();
                      }}
                      pageCount={paginatedApproved.pageCount}
                      pageSize={pageSize}
                      totalItems={paginatedApproved.totalItems}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="REJECTED">
                {rejectedItems.length === 0 ? (
                  <TestimonialEmptyState label="Rejected" hasFilters={hasFilters} />
                ) : (
                  <div className="space-y-5">
                    <TestimonialList
                      items={paginatedRejected.items}
                      isUpdatingId={mutation.isPending ? mutation.variables?.id ?? null : null}
                      onAction={handleAction}
                      onOpenDetails={(testimonial) => setSelectedTestimonialId(testimonial.id)}
                    />
                    <TestimonialPagination
                      currentPage={paginatedRejected.currentPage}
                      onPageChange={(page) =>
                        setPagination((current) => ({ ...current, REJECTED: page }))
                      }
                      onPageSizeChange={(nextPageSize) => {
                        setPageSize(nextPageSize);
                        resetPagination();
                      }}
                      pageCount={paginatedRejected.pageCount}
                      pageSize={pageSize}
                      totalItems={paginatedRejected.totalItems}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {isRefetching && !isPending ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/52">
              Refreshing testimonial queue...
            </p>
          ) : null}
        </CardContent>
      </Card>

      <TestimonialDetailDialog
        open={Boolean(selectedTestimonial)}
        testimonial={selectedTestimonial}
        onClose={() => setSelectedTestimonialId(null)}
        onApprove={(testimonial) => handleAction(testimonial, "approve")}
        onReject={(testimonial) => handleAction(testimonial, "reject")}
        onReopen={(testimonial) => handleAction(testimonial, "reopen")}
        onToggleFeatured={(testimonial) => handleAction(testimonial, "toggleFeatured")}
      />
    </div>
  );
}
