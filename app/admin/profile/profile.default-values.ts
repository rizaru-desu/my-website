import type { ProfileFormValues } from "./profile.schema";

export const profileDefaultValues: ProfileFormValues = {
  fullName: "",
  headline: "",
  shortIntro: "",
  about: "",
  location: "",
  email: "",
  phone: "",
  availability: "",
  primaryCta: "Open the project archive",
  profilePhotoUrl: null,
  socialLinks: [{ label: "github", href: "" }],
  focus: [],
  stats: [],
};
