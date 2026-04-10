import assert from "node:assert/strict";
import test from "node:test";

import { skillSchema } from "../app/admin/skills/skill.schema.ts";

test("skill schema accepts valid persisted skill payloads and trims values", () => {
  const result = skillSchema.parse({
    category: "  Frontend Systems  ",
    featured: true,
    level: "advanced",
    name: "  Next.js  ",
  });

  assert.deepEqual(result, {
    category: "Frontend Systems",
    featured: true,
    level: "advanced",
    name: "Next.js",
  });
});

test("skill schema rejects short labels and invalid levels", () => {
  const result = skillSchema.safeParse({
    category: "",
    featured: false,
    level: "expert",
    name: "N",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);

    assert.ok(messages.includes("Skill name is required."));
    assert.ok(messages.includes("Category is required."));
  }
});
