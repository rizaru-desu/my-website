import { z } from "zod";

export const skillLevelValues = ["beginner", "intermediate", "advanced"] as const;

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill name is required.")
    .max(40, "Keep the skill name under 40 characters."),
  category: z
    .string()
    .trim()
    .min(2, "Category is required.")
    .max(40, "Keep the category under 40 characters."),
  level: z.enum(skillLevelValues),
  featured: z.boolean(),
});

export type SkillLevel = (typeof skillLevelValues)[number];
export type SkillFormValues = z.infer<typeof skillSchema>;
