import { skillGroups } from "@/lib/mock-content";
import type { SkillRecord } from "@/lib/skills.shared";

import type { SkillFormValues, SkillLevel } from "./skill.schema";

const mockLevels: SkillLevel[] = ["advanced", "intermediate", "advanced", "beginner"];

export function createSkillDefaultValues(): SkillFormValues {
  return {
    name: "",
    category: "",
    level: "intermediate",
    featured: false,
  };
}

export const skillSeedRecords: SkillRecord[] = skillGroups.flatMap((group, groupIndex) =>
  group.skills.map((skill, skillIndex) => ({
    createdAt: new Date(0).toISOString(),
    id: `skill-${group.title.toLowerCase().replace(/\s+/g, "-")}-${skill.toLowerCase().replace(/\s+/g, "-")}`,
    source: "fallback",
    updatedAt: new Date(0).toISOString(),
    values: {
      name: skill,
      category: group.title,
      level: mockLevels[(groupIndex + skillIndex) % mockLevels.length] ?? "intermediate",
      featured: skillIndex === 0,
    },
  })),
);
