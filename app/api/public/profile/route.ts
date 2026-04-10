import { NextResponse } from "next/server";

import { getPublicProfileContent } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getPublicProfileContent();
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { message: "The public profile could not be loaded right now." },
      { status: 500 },
    );
  }
}
