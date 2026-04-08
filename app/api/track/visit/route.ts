import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  prepareVisitorTracking,
  VISITOR_COOKIE_NAME,
  writePreparedVisitorTracking,
} from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const trackVisitSchema = z.object({
  documentReferrer: z.string().trim().max(2048).nullable().optional(),
  path: z.string().trim().min(1).max(512),
  referrerPath: z.string().trim().max(512).nullable().optional(),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof trackVisitSchema>;

  try {
    const payload = await request.json();
    body = trackVisitSchema.parse(payload);
  } catch {
    return NextResponse.json(
      { message: "The visit analytics payload is invalid." },
      { status: 400 },
    );
  }

  const existingVisitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value ?? null;
  const prepared = prepareVisitorTracking(body, {
    cookieVisitorId: existingVisitorId,
    requestHeaders: request.headers,
    requestUrl: request.url,
  });

  if (!prepared) {
    return NextResponse.json({ queued: false }, { status: 202 });
  }

  const response = NextResponse.json({ queued: true }, { status: 202 });

  if (!existingVisitorId) {
    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      name: VISITOR_COOKIE_NAME,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: prepared.visitorId,
    });
  }

  after(async () => {
    try {
      await writePreparedVisitorTracking(prepared);
    } catch (error) {
      console.error("Visitor analytics logging failed.", error);
    }
  });

  return response;
}
