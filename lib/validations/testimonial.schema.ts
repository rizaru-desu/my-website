import { z } from "zod";

import {
  testimonialRelationValues,
  type PublicTestimonialInput,
} from "../testimonials.shared.ts";

export const testimonialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please share at least 2 characters for your name.")
    .max(100, "Keep the name under 100 characters."),
  role: z
    .string()
    .trim()
    .min(2, "Please add your role or position.")
    .max(100, "Keep the role under 100 characters."),
  company: z
    .string()
    .trim()
    .max(100, "Keep the company name under 100 characters."),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters for the testimonial.")
    .max(500, "Keep the testimonial under 500 characters."),
  rating: z
    .number()
    .int("Please choose a full-star rating.")
    .min(1, "Choose a rating between 1 and 5.")
    .max(5, "Choose a rating between 1 and 5."),
  relation: z.enum(testimonialRelationValues, {
    error: "Choose the relationship that best fits this testimonial.",
  }),
  _honeypot: z
    .string()
    .trim()
    .max(0, "Please leave this field empty."),
});

export type TestimonialFormValues = PublicTestimonialInput;

export function getFirstTestimonialZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please review the testimonial form and try again.";
}
