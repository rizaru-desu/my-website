"use client";

import { useEffect, useState } from "react";

import { profile as fallbackProfile } from "@/lib/mock-content";
import type { PublicProfileRecord } from "@/lib/profile.shared";

const fallbackPublicProfile: PublicProfileRecord = {
  ...fallbackProfile,
  phone: "+62 812 5555 2401",
  primaryCta: "View Projects",
  profilePhotoUrl: null,
};

export function usePublicProfile() {
  const [profile, setProfile] = useState<PublicProfileRecord>(fallbackPublicProfile);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/public/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as PublicProfileRecord;

        if (isActive) {
          setProfile(payload);
        }
      } catch {
        // keep fallback profile on client if the public API is unavailable
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return profile;
}
