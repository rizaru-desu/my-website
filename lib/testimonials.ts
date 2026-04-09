import "server-only";

import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { testimonials as fallbackTestimonials } from "@/lib/mock-content";
import {
  isMissingTestimonialTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  formatPublicTestimonialRole,
  getNextTestimonialState,
  type AdminTestimonialRecord,
  type PublicHomepageTestimonial,
  type TestimonialActionResult,
  type TestimonialModerationAction,
} from "@/lib/testimonials.shared";

const testimonialAdminRoles = ["architect", "curator", "artisan", "apprentice"] as const;
const TESTIMONIAL_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const TESTIMONIAL_RATE_LIMIT_MAX_SUBMISSIONS = 3;

type StoredTestimonial = {
  id: string;
  name: string;
  role: string;
  company: string | null;
  message: string;
  rating: number;
  relation: AdminTestimonialRecord["relation"];
  status: AdminTestimonialRecord["status"];
  featured: boolean;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AdminTestimonialsContext = {
  currentUserId: string;
  headers: Headers;
  role: string;
};

export class AdminTestimonialsAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminTestimonialsAccessError";
    this.status = status;
  }
}

export class TestimonialsStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestimonialsStorageError";
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeCompany(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isAdminRole(role: string | null | undefined) {
  if (!role) {
    return false;
  }

  return testimonialAdminRoles.includes(role as (typeof testimonialAdminRoles)[number]);
}

const testimonialModel = (prisma as typeof prisma & {
  testimonial: {
    create: (args: unknown) => Promise<StoredTestimonial>;
    findMany: (args: unknown) => Promise<StoredTestimonial[]>;
    findUnique: (args: unknown) => Promise<StoredTestimonial | null>;
    update: (args: unknown) => Promise<StoredTestimonial>;
  };
}).testimonial;

function toAdminRecord(testimonial: StoredTestimonial): AdminTestimonialRecord {
  return {
    company: testimonial.company,
    createdAt: normalizeDate(testimonial.createdAt) ?? new Date(0).toISOString(),
    featured: testimonial.featured,
    id: testimonial.id,
    message: testimonial.message,
    name: testimonial.name,
    rating: testimonial.rating,
    relation: testimonial.relation,
    reviewedAt: normalizeDate(testimonial.reviewedAt),
    role: testimonial.role,
    status: testimonial.status,
    updatedAt: normalizeDate(testimonial.updatedAt) ?? new Date(0).toISOString(),
  };
}

function toPublicRecord(
  testimonial: Pick<
    AdminTestimonialRecord,
    "company" | "id" | "message" | "name" | "rating" | "role"
  >,
): PublicHomepageTestimonial {
  return {
    company: testimonial.company,
    id: testimonial.id,
    message: testimonial.message,
    name: testimonial.name,
    rating: testimonial.rating,
    role: testimonial.role,
  };
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";

  return {
    token,
    url,
  };
}

function hasUpstashConfig() {
  const { token, url } = getUpstashConfig();
  return Boolean(url && token);
}

function resolveClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("fly-client-ip") ||
    "unknown"
  );
}

async function runUpstashCommand(command: string[]) {
  const { token, url } = getUpstashConfig();

  if (!url || !token) {
    throw new Error("Upstash Redis is not configured.");
  }

  const response = await fetch(`${url}/pipeline`, {
    body: JSON.stringify([command]),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("The testimonial rate-limit store could not be reached.");
  }

  const payload = (await response.json()) as Array<{
    error?: string;
    result?: number | string | null;
  }>;

  const result = payload[0];

  if (result?.error) {
    throw new Error(result.error);
  }

  return result?.result;
}

async function enforceSubmissionRateLimit(requestHeaders: Headers) {
  if (!hasUpstashConfig()) {
    return null;
  }

  const ip = resolveClientIp(requestHeaders);
  const key = `testimonial:submit:${ip}`;

  const currentCount = Number(await runUpstashCommand(["incr", key]) ?? 0);

  if (currentCount === 1) {
    await runUpstashCommand([
      "expire",
      key,
      String(TESTIMONIAL_RATE_LIMIT_WINDOW_SECONDS),
    ]);
  }

  if (currentCount > TESTIMONIAL_RATE_LIMIT_MAX_SUBMISSIONS) {
    return {
      ok: false,
      message: "Too many testimonial submissions from this connection. Please try again later.",
    } satisfies TestimonialActionResult;
  }

  return null;
}

function getTestimonialsStorageMessage(error: unknown) {
  if (isMissingTestimonialTableError(error)) {
    return "Testimonial storage is not ready yet. Start the database and run `npx prisma db push` first.";
  }

  if (isPrismaConnectionError(error)) {
    return "The database is not reachable right now. Make sure PostgreSQL is running, then try again.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The testimonial data could not be loaded right now.";
}

function getPublicFallbackTestimonials() {
  return fallbackTestimonials.map((testimonial, index) => {
    const parts = testimonial.role.split(",").map((value) => value.trim());
    const [role, ...companyParts] = parts;

    return {
      company: companyParts.join(", ") || null,
      id: `mock-testimonial-${index + 1}`,
      message: testimonial.quote,
      name: testimonial.name,
      rating: 5,
      role: role || testimonial.role,
    } satisfies PublicHomepageTestimonial;
  });
}

export async function getAdminTestimonialsContext(
  requestHeaders: Headers,
): Promise<AdminTestimonialsContext> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminTestimonialsAccessError(
      401,
      "You must be signed in to review testimonials.",
    );
  }

  if (!isAdminRole(session.user.role)) {
    throw new AdminTestimonialsAccessError(
      403,
      "You are not allowed to review testimonials.",
    );
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
    role: session.user.role ?? "unknown",
  };
}

export async function getAdminTestimonials(): Promise<AdminTestimonialRecord[]> {
  try {
    const testimonials = await testimonialModel.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return testimonials.map((testimonial) => toAdminRecord(testimonial));
  } catch (error) {
    throw new TestimonialsStorageError(getTestimonialsStorageMessage(error));
  }
}

export async function getPublicHomepageTestimonials(): Promise<PublicHomepageTestimonial[]> {
  try {
    const testimonials = await testimonialModel.findMany({
      orderBy: [
        {
          reviewedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      where: {
        featured: true,
        status: "APPROVED",
      },
    });

    return testimonials.map((testimonial) => toPublicRecord(toAdminRecord(testimonial)));
  } catch {
    return getPublicFallbackTestimonials();
  }
}

export async function createPublicTestimonialSubmission(
  requestHeaders: Headers,
  input: {
    company: string;
    message: string;
    name: string;
    rating: number;
    relation: AdminTestimonialRecord["relation"];
    role: string;
  },
): Promise<TestimonialActionResult> {
  const rateLimitResult = await enforceSubmissionRateLimit(requestHeaders);

  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    await testimonialModel.create({
      data: {
        company: normalizeCompany(input.company),
        message: input.message,
        name: input.name,
        rating: input.rating,
        relation: input.relation,
        role: input.role,
        status: "PENDING",
      },
    });

    return {
      ok: true,
      message:
        "Thanks for the testimonial. It is now waiting in the moderation queue.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getTestimonialsStorageMessage(error),
    };
  }
}

export async function updateAdminTestimonial(
  testimonialId: string,
  action: TestimonialModerationAction,
): Promise<TestimonialActionResult> {
  if (!testimonialId.trim()) {
    return {
      ok: false,
      message: "The selected testimonial is missing.",
    };
  }

  try {
    const current = await testimonialModel.findUnique({
      where: {
        id: testimonialId,
      },
    });

    if (!current) {
      return {
        ok: false,
        message: "That testimonial could not be found anymore.",
      };
    }

    const nextState = getNextTestimonialState(toAdminRecord(current), action);

    await testimonialModel.update({
      data: {
        featured: nextState.featured,
        reviewedAt: nextState.reviewedAt ? new Date(nextState.reviewedAt) : null,
        status: nextState.status,
      },
      where: {
        id: current.id,
      },
    });

    if (action === "approve") {
      return {
        ok: true,
        message: "Testimonial approved and ready for optional featuring.",
      };
    }

    if (action === "reject") {
      return {
        ok: true,
        message: "Testimonial rejected and removed from public proof.",
      };
    }

    if (action === "reopen") {
      return {
        ok: true,
        message: "Testimonial returned to the pending review queue.",
      };
    }

    return {
      ok: true,
      message: nextState.featured
        ? "Testimonial featured on the homepage."
        : "Testimonial removed from the homepage proof grid.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getTestimonialsStorageMessage(error),
    };
  }
}

export function getPublicTestimonialMeta(testimonial: Pick<PublicHomepageTestimonial, "company" | "role">) {
  return formatPublicTestimonialRole(testimonial);
}
