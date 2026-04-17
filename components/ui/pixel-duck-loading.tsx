"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PixelDuckLoadingProps = {
  className?: string;
};

export function PixelDuckLoading({ className }: PixelDuckLoadingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let animation: import("lottie-web").AnimationItem | null = null;
    let detachFailureListener: (() => void) | null = null;
    let detachDomLoadedListener: (() => void) | null = null;

    async function loadDuck() {
      if (!containerRef.current || prefersReducedMotion === null) {
        return;
      }

      setLoadFailed(false);
      setAnimationReady(false);

      try {
        const { default: lottie } = await import("lottie-web");

        if (cancelled || !containerRef.current) {
          return;
        }

        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: !prefersReducedMotion,
          autoplay: !prefersReducedMotion,
          path: "/animations/pixel-duck.json",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
          },
        });

        const handleDataFailed = () => {
          if (!cancelled) {
            setLoadFailed(true);
            setAnimationReady(false);
          }
        };

        const handleDomLoaded = () => {
          if (cancelled || !animation) {
            return;
          }

          if (prefersReducedMotion) {
            animation.goToAndStop(0, true);
          }

          setAnimationReady(true);
        };

        animation.addEventListener("data_failed", handleDataFailed);
        animation.addEventListener("DOMLoaded", handleDomLoaded);

        detachFailureListener = () => animation?.removeEventListener("data_failed", handleDataFailed);
        detachDomLoadedListener = () => animation?.removeEventListener("DOMLoaded", handleDomLoaded);
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
          setAnimationReady(false);
        }
      }
    }

    void loadDuck();

    return () => {
      cancelled = true;
      detachFailureListener?.();
      detachDomLoadedListener?.();
      animation?.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] border-[3px] border-ink bg-white/80 p-4 shadow-[7px_7px_0_var(--ink)]",
        className,
      )}
    >
      <div className="paper-grid absolute inset-0 opacity-35" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-4">
        <div
          ref={containerRef}
          className={cn(
            "h-44 w-44 sm:h-52 sm:w-52",
            loadFailed && "hidden",
          )}
          aria-hidden="true"
        />

        {!animationReady && !loadFailed ? (
          <div
            className="absolute inset-x-0 top-6 flex flex-col items-center gap-3"
            aria-hidden="true"
          >
            <div className="h-44 w-44 animate-pulse rounded-[28px] border-[3px] border-dashed border-ink/30 bg-panel/70 sm:h-52 sm:w-52" />
            <Badge variant="cream">Preparing Duck</Badge>
          </div>
        ) : null}

        {loadFailed ? (
          <div className="flex min-h-44 w-full max-w-[14rem] flex-col items-center justify-center gap-3 rounded-[24px] border-[3px] border-dashed border-ink/35 bg-panel/80 px-5 py-6 text-center sm:min-h-52">
            <Badge variant="red">Duck Offline</Badge>
            <p className="font-display text-3xl uppercase leading-none text-ink">
              Pixel Duck
            </p>
            <p className="text-sm leading-6 text-ink/72">
              Loading the public route while the animation catches up.
            </p>
          </div>
        ) : null}

        {prefersReducedMotion ? (
          <Badge variant="blue" className="text-[0.66rem]">
            Reduced Motion
          </Badge>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/58">
            Animated route transition
          </p>
        )}
      </div>
    </div>
  );
}
