import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please share at least 2 characters for your name.")
    .max(80, "Keep the name under 80 characters."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),
  subject: z
    .string()
    .trim()
    .min(3, "Please add a short subject line.")
    .max(120, "Keep the subject under 120 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail to your message.")
    .max(5000, "Keep the message under 5000 characters."),
  website: z
    .string()
    .trim()
    .max(0, "Please leave this field empty."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export function getFirstZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please review the form and try again.";
}
