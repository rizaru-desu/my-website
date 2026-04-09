export const testimonialStatusValues = ["PENDING", "APPROVED", "REJECTED"] as const;

export const testimonialRelationValues = [
  "CLIENT",
  "COLLEAGUE",
  "MENTOR",
  "OTHER",
] as const;

export const testimonialModerationActionValues = [
  "approve",
  "reject",
  "reopen",
  "toggleFeatured",
] as const;

export type TestimonialStatusValue = (typeof testimonialStatusValues)[number];
export type TestimonialRelationValue = (typeof testimonialRelationValues)[number];
export type TestimonialModerationAction =
  (typeof testimonialModerationActionValues)[number];

export type TestimonialActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type PublicTestimonialInput = {
  _honeypot: string;
  company: string;
  message: string;
  name: string;
  rating: number;
  relation: TestimonialRelationValue;
  role: string;
};

export type AdminTestimonialRecord = {
  id: string;
  name: string;
  role: string;
  company: string | null;
  message: string;
  rating: number;
  relation: TestimonialRelationValue;
  status: TestimonialStatusValue;
  featured: boolean;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicHomepageTestimonial = {
  id: string;
  name: string;
  role: string;
  company: string | null;
  message: string;
  rating: number;
};

export function getTestimonialStatusLabel(status: TestimonialStatusValue) {
  if (status === "APPROVED") {
    return "Approved";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  return "Pending";
}

export function getTestimonialRelationLabel(relation: TestimonialRelationValue) {
  if (relation === "CLIENT") {
    return "Client";
  }

  if (relation === "COLLEAGUE") {
    return "Colleague";
  }

  if (relation === "MENTOR") {
    return "Mentor";
  }

  return "Other";
}

export function formatTestimonialDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function renderTestimonialStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

export function formatPublicTestimonialRole(testimonial: Pick<PublicHomepageTestimonial, "role" | "company">) {
  return testimonial.company ? `${testimonial.role}, ${testimonial.company}` : testimonial.role;
}

export function getNextTestimonialState(
  current: Pick<AdminTestimonialRecord, "featured" | "reviewedAt" | "status">,
  action: TestimonialModerationAction,
  now = new Date(),
) {
  if (action === "approve") {
    if (current.status === "APPROVED") {
      throw new Error("This testimonial is already approved.");
    }

    return {
      featured: current.featured,
      reviewedAt: now.toISOString(),
      status: "APPROVED" as const,
    };
  }

  if (action === "reject") {
    if (current.status === "REJECTED") {
      throw new Error("This testimonial is already rejected.");
    }

    return {
      featured: false,
      reviewedAt: now.toISOString(),
      status: "REJECTED" as const,
    };
  }

  if (action === "reopen") {
    if (current.status === "PENDING") {
      throw new Error("This testimonial is already pending review.");
    }

    return {
      featured: false,
      reviewedAt: current.reviewedAt,
      status: "PENDING" as const,
    };
  }

  if (current.status !== "APPROVED") {
    throw new Error("Only approved testimonials can be featured.");
  }

  return {
    featured: !current.featured,
    reviewedAt: current.reviewedAt ?? now.toISOString(),
    status: "APPROVED" as const,
  };
}
