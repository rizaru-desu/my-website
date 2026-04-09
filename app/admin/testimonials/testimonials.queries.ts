import type {
  AdminTestimonialRecord,
  TestimonialActionResult,
  TestimonialModerationAction,
} from "@/lib/testimonials.shared";

export const adminTestimonialsQueryKey = ["admin-testimonials", "list"] as const;

async function readActionResult(
  response: Response,
  fallback: string,
): Promise<TestimonialActionResult> {
  try {
    const payload = (await response.json()) as Partial<TestimonialActionResult>;

    if (typeof payload.message === "string") {
      return {
        ok: Boolean(payload.ok),
        message: payload.message,
      } as TestimonialActionResult;
    }
  } catch {
    // ignore invalid payloads
  }

  return {
    ok: false,
    message: fallback,
  };
}

export async function fetchAdminTestimonials(): Promise<AdminTestimonialRecord[]> {
  const response = await fetch("/api/admin/testimonials", {
    cache: "no-store",
    method: "GET",
  });

  if (!response.ok) {
    const result = await readActionResult(
      response,
      "The testimonial queue could not be loaded right now.",
    );
    throw new Error(result.message);
  }

  return (await response.json()) as AdminTestimonialRecord[];
}

export async function updateAdminTestimonialAction(input: {
  action: TestimonialModerationAction;
  id: string;
}) {
  const response = await fetch(`/api/admin/testimonials/${input.id}`, {
    body: JSON.stringify({
      action: input.action,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const result = await readActionResult(
    response,
    "The testimonial moderation action could not be completed.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}
