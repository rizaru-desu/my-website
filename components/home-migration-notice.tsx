"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "portfolio-home-migration-notice-dismissed";

export function HomeMigrationNotice() {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setDismissed(false);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready || dismissed) {
    return null;
  }

  return (
    <div className="sticky top-4 z-30">
      <div className="relative overflow-hidden rounded-[28px] border-[3px] border-ink bg-white/90 px-5 py-4 shadow-[8px_8px_0_var(--ink)] backdrop-blur">
        <div className="absolute right-6 top-0 h-16 w-16 -translate-y-4 rotate-12 rounded-[22px] border-[3px] border-ink bg-accent-blue/15" />
        <div className="relative flex flex-col gap-4 pr-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-blue">
              Migration Notice
            </p>
            <h2 className="font-display text-2xl uppercase leading-none text-ink sm:text-3xl">
              Go + Vite build in progress for STB TV Armbian.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-ink/78 sm:text-base">
              This Next.js version remains the active reference for product structure,
              content flow, and UI behavior while the platform is prepared for a leaner
              Go + Vite runtime on STB TV devices running Armbian.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close migration notice"
            className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-accent-red text-lg font-bold text-white shadow-[4px_4px_0_var(--ink)] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
            onClick={() => {
              setDismissed(true);

              try {
                window.localStorage.setItem(DISMISS_KEY, "true");
              } catch {}
            }}
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
