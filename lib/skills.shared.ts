import type { SkillFormValues } from "@/app/admin/skills/skill.schema";

export type SkillRecord = {
  createdAt: string;
  id: string;
  source: "database" | "fallback";
  updatedAt: string;
  values: SkillFormValues;
};

export type SkillActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type PublicSkillGroup = {
  category: string;
  skills: SkillRecord[];
};
