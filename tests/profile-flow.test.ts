import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_PROFILE_PHOTO_DATA_URL_LENGTH,
  profileSchema,
} from "../app/admin/profile/profile.schema.ts";

const validProfilePayload = {
  about:
    "I build polished web products with clear storytelling, resilient systems, and practical execution details that help teams move faster with confidence.",
  availability: "Available for selective 2026 opportunities",
  email: "rizal@example.com",
  fullName: "Rizal Achmad",
  headline: "Full-Stack Product Engineer",
  location: "Jakarta, Indonesia",
  phone: "+62 812 5555 2401",
  primaryCta: "Open Projects",
  profilePhotoUrl: null,
  shortIntro:
    "Designing fast, memorable portfolio products that feel sharp and credible.",
  socialLinks: [
    {
      href: "https://github.com/rizal",
      label: "GitHub",
    },
  ],
};

test("profile schema accepts valid image data URLs", () => {
  const result = profileSchema.parse({
    ...validProfilePayload,
    profilePhotoUrl: "data:image/png;base64,iVBORw0KGgo=",
  });

  assert.equal(result.profilePhotoUrl, "data:image/png;base64,iVBORw0KGgo=");
});

test("profile schema accepts empty or removed profile photos", () => {
  assert.equal(profileSchema.parse(validProfilePayload).profilePhotoUrl, null);

  const result = profileSchema.parse({
    ...validProfilePayload,
    profilePhotoUrl: "",
  });

  assert.equal(result.profilePhotoUrl, null);
});

test("profile schema rejects invalid or oversized profile photos", () => {
  const invalidResult = profileSchema.safeParse({
    ...validProfilePayload,
    profilePhotoUrl: "https://example.com/avatar.png",
  });

  const oversizedResult = profileSchema.safeParse({
    ...validProfilePayload,
    profilePhotoUrl: `data:image/png;base64,${"a".repeat(
      MAX_PROFILE_PHOTO_DATA_URL_LENGTH,
    )}`,
  });

  assert.equal(invalidResult.success, false);
  assert.equal(oversizedResult.success, false);
});

test("profile schema preserves social link min and max validation", () => {
  const emptyLinksResult = profileSchema.safeParse({
    ...validProfilePayload,
    socialLinks: [],
  });
  const tooManyLinksResult = profileSchema.safeParse({
    ...validProfilePayload,
    socialLinks: Array.from({ length: 5 }, (_, index) => ({
      href: `https://example.com/${index}`,
      label: `Link ${index}`,
    })),
  });

  assert.equal(emptyLinksResult.success, false);
  assert.equal(tooManyLinksResult.success, false);
});
