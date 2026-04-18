"use client";

import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

export function ResumeDownloadNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("download") !== "unavailable") {
    return null;
  }

  return (
    <EditorialCard accent="red" className="space-y-3">
      <Badge variant="red">Download Unavailable</Badge>
      <h2 className="font-display text-3xl uppercase leading-none text-ink">
        CV download is not configured yet.
      </h2>
      <p className="text-sm leading-7 text-ink/78">
        Add `RESUME_DOWNLOAD_URL` on the server, then try the download button again.
        The resume page itself still stays available for recruiters to scan.
      </p>
    </EditorialCard>
  );
}
