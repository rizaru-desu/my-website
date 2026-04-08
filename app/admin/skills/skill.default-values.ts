import { skillGroups } from "@/lib/mock-content";

import type { SkillFormValues, SkillLevel } from "./skill.schema";

export type SkillRecord = {
  id: string;
  values: SkillFormValues;
};

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
    id: `skill-${group.title.toLowerCase().replace(/\s+/g, "-")}-${skill.toLowerCase().replace(/\s+/g, "-")}`,
    values: {
      name: skill,
      category: group.title,
      level: mockLevels[(groupIndex + skillIndex) % mockLevels.length] ?? "intermediate",
      featured: skillIndex === 0,
    },
  })),
);
