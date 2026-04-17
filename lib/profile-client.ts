"use client";

import { useEffect, useState } from "react";

import type { PublicProfileRecord } from "@/lib/profile.shared";

const fallbackPublicProfile: PublicProfileRecord = {
  name: "",
  role: "",
  location: "",
  availability: "",
  tagline: "",
  intro: "",
  email: "",
  phone: "",
  primaryCta: "",
  profilePhotoUrl: null,
  focus: [],
  stats: [],
  socialLinks: [],
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
