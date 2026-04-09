import { NextResponse } from "next/server";

import { trackResumeDownloadRequest } from "@/lib/resume";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await trackResumeDownloadRequest(request.headers, request.url);

  return NextResponse.redirect(new URL(result.location, request.url), {
    status: result.ok ? 307 : 303,
  });
}
