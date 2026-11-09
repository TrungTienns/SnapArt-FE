"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type HomeIntroPhase = "painting" | "revealing" | "done";

export function HomeIntro({
  phase,
  onPhaseChange,
}: {
  phase: HomeIntroPhase;
  onPhaseChange: (phase: HomeIntroPhase) => void;
}) {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 460 : 4200;
    const start = performance.now();
    let frame = 0;
    let timeout = 0;

    const paint = (now: number) => {
      const fraction = Math.max(0, Math.min(1, (now - start) / duration));
      setProgress(1 + Math.floor(99 * fraction));

      if (fraction < 1) {
        frame = requestAnimationFrame(paint);
        return;
      }

      timeout = window.setTimeout(() => {
        if (reducedMotion) {
          onPhaseChange("done");
        } else {
          onPhaseChange("revealing");
          timeout = window.setTimeout(() => onPhaseChange("done"), 600);
        }
      }, reducedMotion ? 100 : 300);
    };

    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [onPhaseChange]);

  return (
    <div className="home-intro" data-home-intro={phase} data-lenis-prevent>
      <div className="home-intro-center" aria-hidden="true">
        <p
          className="home-intro-wordmark font-pencil"
          style={{ "--intro-progress": (progress - 1) / 99 } as CSSProperties}
        >
          SnapAr<span className="home-intro-last-letter">t<svg
            className="home-intro-flower"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <path
              d="M19 15C10 7 17 2 21 5c3 2 3 7 2 10 5-8 13-7 13-2 0 4-5 7-10 8 8 0 13 6 9 10-3 3-8 0-12-5 3 8-1 13-6 11-4-2-3-8-1-12-7 6-14 4-13-1 1-4 7-6 12-5-8-2-11-8-7-11 3-2 8 2 11 7Z"
              fill="var(--color-surface-canvas)"
              stroke="currentColor"
              strokeWidth="1.55"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="21" r="3.6" fill="var(--color-wordmark-r)" stroke="currentColor" strokeWidth="1.2" />
          </svg></span>
        </p>
        <svg className="home-intro-stroke" viewBox="0 0 480 65" fill="none">
          <path d="M16 44C97 13 220 19 326 27c56 4 104 1 138-12" stroke="currentColor" strokeWidth="1.5" opacity=".3" />
          <path
            d="M16 44C97 13 220 19 326 27c56 4 104 1 138-12"
            pathLength="100"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
          />
          <path
            d="M34 48c88-20 186-16 275-12 50 2 89 2 128-5"
            pathLength="100"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            opacity=".62"
          />
        </svg>
      </div>
      <span className="home-intro-counter" aria-hidden="true">{progress}<small>%</small></span>

      <div
        className="sr-only"
        role="progressbar"
        aria-label="Opening SnapArt"
        aria-valuemin={1}
        aria-valuemax={100}
        aria-valuenow={progress}
      />
    </div>
  );
}
