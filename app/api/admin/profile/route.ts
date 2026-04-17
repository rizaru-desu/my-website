import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  AdminProfileAccessError,
  getAdminProfileContent,
  getAdminProfileContext,
  updateAdminProfileContent,
} from "@/lib/profile";
import type { ProfileStat } from "@/lib/profile.shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await getAdminProfileContext(request.headers);
    const profile = await getAdminProfileContent();

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof AdminProfileAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The profile could not be loaded right now." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await getAdminProfileContext(request.headers);
    const payload = (await request.json()) as {
      availability?: string;
      about?: string;
      email?: string;
      focus?: string[];
      fullName?: string;
      headline?: string;
      location?: string;
      phone?: string;
      primaryCta?: string;
      profilePhotoUrl?: string | null;
      shortIntro?: string;
      socialLinks?: Array<{ href?: string; label?: string }>;
      stats?: Array<Partial<ProfileStat>>;
    };

    const result = await updateAdminProfileContent({
      availability: payload.availability ?? "",
      about: payload.about ?? "",
      email: payload.email ?? "",
      focus:
        payload.focus?.map((item) => (typeof item === "string" ? item : "")).filter(Boolean) ?? [],
      fullName: payload.fullName ?? "",
      headline: payload.headline ?? "",
      location: payload.location ?? "",
      phone: payload.phone ?? "",
      primaryCta: payload.primaryCta ?? "",
      profilePhotoUrl:
        typeof payload.profilePhotoUrl === "string" ? payload.profilePhotoUrl : null,
      shortIntro: payload.shortIntro ?? "",
      stats:
        payload.stats?.map((stat) => ({
          detail: stat.detail ?? "",
          label: stat.label ?? "",
          value: stat.value ?? "",
        })) ?? [],
      socialLinks:
        payload.socialLinks?.map((link) => ({
          href: link.href ?? "",
          label: link.label ?? "",
        })) ?? [],
    });

    if (result.ok) {
      revalidatePath("/");
      revalidatePath("/resume");
      revalidatePath("/admin");
      revalidatePath("/admin/profile");
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminProfileAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The profile could not be updated." },
      { status: 500 },
    );
  }
}
