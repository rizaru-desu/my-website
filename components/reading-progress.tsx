"use client";

import { useEffect, useEffectEvent, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  const updateProgress = useEffectEvent(() => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const nextProgress = totalHeight <= 0 ? 0 : (window.scrollY / totalHeight) * 100;
    setProgress(Math.min(100, Math.max(0, nextProgress)));
  });

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-3 border-b-[3px] border-ink bg-panel/80 backdrop-blur">
      <div
        className="h-full bg-accent-red transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
