import { z } from "zod";

export const messageReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(10, "Write a fuller reply before sending it.")
    .max(5000, "Keep the reply under 5000 characters."),
  subject: z
    .string()
    .trim()
    .min(3, "Add a subject for the reply.")
    .max(160, "Keep the reply subject under 160 characters."),
});

export type MessageReplyValues = z.infer<typeof messageReplySchema>;
