import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  AdminTestimonialsAccessError,
  getAdminTestimonialsContext,
  updateAdminTestimonial,
} from "@/lib/testimonials";
import { testimonialModerationActionValues } from "@/lib/testimonials.shared";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await getAdminTestimonialsContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as { action?: string };

    if (
      !payload.action ||
      !testimonialModerationActionValues.includes(payload.action as never)
    ) {
      return NextResponse.json(
        { message: "The testimonial moderation action is invalid." },
        { status: 400 },
      );
    }

    const result = await updateAdminTestimonial(
      id,
      payload.action as (typeof testimonialModerationActionValues)[number],
    );

    if (result.ok) {
      revalidatePath("/");
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminTestimonialsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The testimonial could not be updated." },
      { status: 500 },
    );
  }
}
