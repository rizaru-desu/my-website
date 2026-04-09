import { NextResponse } from "next/server";

import {
  AdminTestimonialsAccessError,
  getAdminTestimonials,
  getAdminTestimonialsContext,
  TestimonialsStorageError,
} from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await getAdminTestimonialsContext(request.headers);
    const testimonials = await getAdminTestimonials();

    return NextResponse.json(testimonials);
  } catch (error) {
    if (error instanceof AdminTestimonialsAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof TestimonialsStorageError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "The testimonial queue could not be loaded right now." },
      { status: 500 },
    );
  }
}
