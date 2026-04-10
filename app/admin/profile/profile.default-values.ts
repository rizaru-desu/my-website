import { profile } from "@/lib/mock-content";

import type { ProfileFormValues } from "./profile.schema";

export const profileDefaultValues: ProfileFormValues = {
  fullName: profile.name,
  headline: profile.role,
  shortIntro: profile.tagline,
  about:
    `${profile.intro} I focus on turning ambitious visual direction into UI systems that feel both memorable and maintainable for real product teams.`,
  location: profile.location,
  email: profile.email,
  phone: "+62 812 5555 2401",
  availability: profile.availability,
  primaryCta: "Open the project archive",
  profilePhotoUrl: null,
  socialLinks: profile.socialLinks.map((link) => ({
    label: link.label,
    href: link.href,
  })),
};
