"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
  isTrackedPublicPath,
  normalizeTrackedPath,
} from "@/lib/visitor-analytics.shared";

const TRACK_VISIT_ENDPOINT = "/api/track/visit";

type TrackVisitPayload = {
  documentReferrer?: string | null;
  path: string;
  referrerPath?: string | null;
};

function sendVisit(payload: TrackVisitPayload) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(
      TRACK_VISIT_ENDPOINT,
      new Blob([body], { type: "application/json" }),
    );

    if (sent) {
      return;
    }
  }

  void fetch(TRACK_VISIT_ENDPOINT, {
    body,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
    method: "POST",
  }).catch(() => {
    // Tracking should stay invisible to the visitor if the beacon fails.
  });
}

export function PublicVisitorTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const normalizedPath = normalizeTrackedPath(pathname || "/");
    const previousPath = previousPathRef.current;
    previousPathRef.current = normalizedPath;

    if (!isTrackedPublicPath(normalizedPath)) {
      return;
    }

    let cancelled = false;
    let frameId = 0;

    const trackVisit = () => {
      if (cancelled) {
        return;
      }

      sendVisit({
        documentReferrer: document.referrer || null,
        path: normalizedPath,
        referrerPath: previousPath,
      });
    };

    if (document.visibilityState === "visible") {
      frameId = window.requestAnimationFrame(trackVisit);

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(frameId);
      };
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      trackVisit();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  return null;
}
