import { NextResponse } from "next/server";

import { trackResumeDownloadRequest } from "@/lib/resume";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const result = await trackResumeDownloadRequest(request.headers, request.url);

  if (result.type === "stream") {
    return new NextResponse(result.download.body, {
      headers: {
        "cache-control": "private, no-store, max-age=0",
        "content-disposition": `attachment; filename="${result.download.fileName}"`,
        "content-type": result.download.contentType ?? "application/pdf",
        ...(result.download.contentLength
          ? { "content-length": String(result.download.contentLength) }
          : {}),
        ...(result.download.etag ? { etag: result.download.etag } : {}),
        ...(result.download.lastModified
          ? { "last-modified": result.download.lastModified }
          : {}),
      },
      status: 200,
    });
  }

  return NextResponse.redirect(new URL(result.location, request.url), {
    status: result.ok ? 307 : 303,
  });
}
