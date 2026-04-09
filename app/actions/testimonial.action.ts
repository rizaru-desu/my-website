"use server";

import { headers } from "next/headers";
import { ZodError } from "zod";

import { createPublicTestimonialSubmission } from "@/lib/testimonials";
import {
  getFirstTestimonialZodMessage,
  testimonialSchema,
} from "@/lib/validations/testimonial.schema";
import type {
  PublicTestimonialInput,
  TestimonialActionResult,
} from "@/lib/testimonials.shared";

export async function submitTestimonialAction(
  input: PublicTestimonialInput,
): Promise<TestimonialActionResult> {
  try {
    const values = testimonialSchema.parse(input);

    if (values._honeypot) {
      return {
        ok: true,
        message:
          "Thanks for the testimonial. It is now waiting in the moderation queue.",
      };
    }

    const requestHeaders = await headers();

    return createPublicTestimonialSubmission(requestHeaders, {
      company: values.company,
      message: values.message,
      name: values.name,
      rating: values.rating,
      relation: values.relation,
      role: values.role,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: getFirstTestimonialZodMessage(error),
      };
    }

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "The testimonial could not be submitted right now.",
    };
  }
}
