import type { SkillFormValues } from "./skill.schema";

export function createSkillDefaultValues(): SkillFormValues {
  return {
    name: "",
    category: "",
    level: "intermediate",
    featured: false,
  };
}

