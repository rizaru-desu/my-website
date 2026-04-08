import { NextResponse } from "next/server";

import { getAppVersionInfo } from "@/lib/app-version";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(getAppVersionInfo());
}
