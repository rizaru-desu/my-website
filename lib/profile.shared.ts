export type ProfileLink = {
  href: string;
  label: string;
};

export type ProfileStat = {
  label: string;
  value: string;
  detail: string;
};

export type PublicProfileRecord = {
  name: string;
  role: string;
  location: string;
  availability: string;
  tagline: string;
  intro: string;
  email: string;
  phone: string;
  primaryCta: string;
  profilePhotoUrl: string | null;
  focus: string[];
  stats: ProfileStat[];
  socialLinks: ProfileLink[];
};

export type AdminProfileRecord = {
  availability: string;
  about: string;
  email: string;
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  primaryCta: string;
  profilePhotoUrl: string | null;
  shortIntro: string;
  socialLinks: ProfileLink[];
  focus: string[];
  stats: ProfileStat[];
  source: "database" | "fallback";
  updatedAt: string | null;
};

export type ProfileActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function getProfileInitials(name: string | null | undefined) {
  const label = name?.trim() || "Profile";
  const parts = label.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function formatProfileUpdatedAt(value: string | null) {
  if (!value) {
    return "Using fallback content";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
