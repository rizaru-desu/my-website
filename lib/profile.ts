import "server-only";

import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import {
  isMissingProfileContentTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  type AdminProfileRecord,
  type ProfileActionResult,
  type ProfileLink,
  type PublicProfileRecord,
  type ProfileStat,
} from "@/lib/profile.shared";
import { profileSchema } from "@/app/admin/profile/profile.schema";

type StoredProfileContent = {
  about: string;
  availability: string;
  createdAt: Date;
  email: string;
  fullName: string;
  headline: string;
  id: string;
  location: string;
  phone: string;
  primaryCta: string;
  profilePhotoUrl?: string | null;
  shortIntro: string;
  socialLinks: unknown;
  focus: string[];
  stats: unknown;
  storageKey: string;
  updatedAt: Date;
};

const PRIMARY_PROFILE_STORAGE_KEY = "primary";

const profileContentModel = (
  prisma as typeof prisma & {
    profileContent: {
      findUnique: (args: unknown) => Promise<StoredProfileContent | null>;
      upsert: (args: unknown) => Promise<StoredProfileContent>;
    };
  }
).profileContent;

export class AdminProfileAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminProfileAccessError";
    this.status = status;
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getFallbackSocialLinks() {
  return [
    { label: "github", href: "https://github.com/rizal-achmad" },
    { label: "linkedin", href: "https://linkedin.com/in/rizal-achmad" },
  ];
}

function getFallbackAdminProfileRecord(): AdminProfileRecord {
  return {
    availability: "Available for selective 2026 opportunities",
    about:
      "I build web experiences that give recruiters clarity fast. I focus on turning ambitious visual direction into UI systems that feel both memorable and maintainable for real product teams.",
    email: "hello@rizaru-desu.my.id",
    fullName: "Rizal Achmad Saputra",
    headline: "Full-Stack Product Engineer",
    location: "Tangerang Selatan, Indonesia",
    phone: "+62 816 5340 24",
    primaryCta: "View Projects",
    profilePhotoUrl: null,
    shortIntro:
      "Designing fast, memorable portfolio products that feel as sharp as the work behind them.",
    socialLinks: getFallbackSocialLinks(),
    focus: [],
    stats: [],
    source: "fallback",
    updatedAt: null,
  };
}

function normalizeSocialLinks(value: unknown): ProfileLink[] {
  if (!Array.isArray(value)) {
    return getFallbackSocialLinks();
  }

  const links = value
    .map((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "href" in item &&
        typeof item.label === "string" &&
        typeof item.href === "string"
      ) {
        return {
          href: item.href.trim(),
          label: item.label.trim(),
        };
      }

      return null;
    })
    .filter((item): item is ProfileLink => Boolean(item?.label && item?.href));

  return links.length > 0 ? links : getFallbackSocialLinks();
}

function normalizeStats(value: unknown): ProfileStat[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "value" in item &&
        "detail" in item &&
        typeof item.label === "string" &&
        typeof item.value === "string" &&
        typeof item.detail === "string"
      ) {
        return {
          label: item.label.trim(),
          value: item.value.trim(),
          detail: item.detail.trim(),
        };
      }
      return null;
    })
    .filter((item): item is ProfileStat => Boolean(item?.label));
}

function toAdminProfileRecord(
  stored: StoredProfileContent,
): AdminProfileRecord {
  return {
    availability: stored.availability,
    about: stored.about,
    email: stored.email,
    fullName: stored.fullName,
    headline: stored.headline,
    location: stored.location,
    phone: stored.phone,
    primaryCta: stored.primaryCta,
    profilePhotoUrl: stored.profilePhotoUrl ?? null,
    shortIntro: stored.shortIntro,
    socialLinks: normalizeSocialLinks(stored.socialLinks),
    focus: Array.isArray(stored.focus) ? stored.focus : [],
    stats: normalizeStats(stored.stats),
    source: "database",
    updatedAt: normalizeDate(stored.updatedAt),
  };
}

function mergePublicProfileWithAdminRecord(
  record: AdminProfileRecord,
): PublicProfileRecord {
  return {
    availability: record.availability,
    email: record.email,
    intro: record.about,
    location: record.location,
    name: record.fullName,
    phone: record.phone,
    primaryCta: record.primaryCta,
    profilePhotoUrl: record.profilePhotoUrl,
    role: record.headline,
    socialLinks: record.socialLinks,
    tagline: record.shortIntro,
    focus: record.focus,
    stats: record.stats,
  } satisfies PublicProfileRecord;
}

async function getStoredProfileContent() {
  try {
    return await profileContentModel.findUnique({
      where: {
        storageKey: PRIMARY_PROFILE_STORAGE_KEY,
      },
    });
  } catch (error) {
    if (
      isMissingProfileContentTableError(error) ||
      isPrismaConnectionError(error)
    ) {
      return null;
    }

    throw error;
  }
}

export async function getAdminProfileContext(requestHeaders: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminProfileAccessError(
      401,
      "You must be signed in to manage the public profile.",
    );
  }

  if (session.user.role !== "architect") {
    throw new AdminProfileAccessError(
      403,
      "You are not allowed to manage the public profile.",
    );
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
    role: session.user.role ?? "",
  };
}

export async function getAdminProfileContent(): Promise<AdminProfileRecord> {
  const storedProfile = await getStoredProfileContent();

  if (!storedProfile) {
    return getFallbackAdminProfileRecord();
  }

  return toAdminProfileRecord(storedProfile);
}

export async function getPublicProfileContent(): Promise<PublicProfileRecord> {
  const adminProfile = await getAdminProfileContent();
  return mergePublicProfileWithAdminRecord(adminProfile);
}

export async function updateAdminProfileContent(
  input: Omit<AdminProfileRecord, "source" | "updatedAt">,
): Promise<ProfileActionResult> {
  try {
    const values = profileSchema.parse(input);

    await profileContentModel.upsert({
      where: {
        storageKey: PRIMARY_PROFILE_STORAGE_KEY,
      },
      update: {
        availability: values.availability,
        about: values.about,
        email: values.email,
        fullName: values.fullName,
        headline: values.headline,
        location: values.location,
        phone: values.phone,
        primaryCta: values.primaryCta,
        profilePhotoUrl: values.profilePhotoUrl,
        shortIntro: values.shortIntro,
        socialLinks: values.socialLinks,
        focus: values.focus,
        stats: values.stats,
      },
      create: {
        availability: values.availability,
        about: values.about,
        email: values.email,
        fullName: values.fullName,
        headline: values.headline,
        location: values.location,
        phone: values.phone,
        primaryCta: values.primaryCta,
        profilePhotoUrl: values.profilePhotoUrl,
        shortIntro: values.shortIntro,
        socialLinks: values.socialLinks,
        focus: values.focus,
        stats: values.stats,
        storageKey: PRIMARY_PROFILE_STORAGE_KEY,
      },
    });

    return {
      ok: true,
      message:
        "Profile saved. Public identity content now reflects the latest editor changes.",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message:
          error.issues[0]?.message ?? "Please review the profile form values.",
      };
    }

    if (isMissingProfileContentTableError(error)) {
      return {
        ok: false,
        message:
          "Profile storage is not ready yet. Start the database and run `npx prisma db push` first.",
      };
    }

    if (isPrismaConnectionError(error)) {
      return {
        ok: false,
        message:
          "The database is not reachable right now. Make sure PostgreSQL is running, then try again.",
      };
    }

    if (error instanceof Error && error.message) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "The profile could not be saved right now.",
    };
  }
}

export async function hasPersistedProfileContentCoverage() {
  const profileRecord = await getAdminProfileContent();
  return profileRecord.source === "database";
}
