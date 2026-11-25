"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

export function HeaderSnowman() {
  const container = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let animation: AnimationItem | undefined;

    const syncPlayback = () => {
      if (!animation) return;
      if (motion.matches) animation.goToAndStop(0, true);
      else if (document.hidden) animation.pause();
      else animation.play();
    };

    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed) return;
      animation = lottie.loadAnimation({
        container: element,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: "/assets/animations/Snowman.json",
      });
      animation.addEventListener("DOMLoaded", syncPlayback);
      syncPlayback();
    }).catch(() => {
      // The logo and navigation remain usable if the decorative animation fails.
    });

    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      disposed = true;
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      animation?.destroy();
    };
  }, []);

  return <span ref={container} className="header-snowman" aria-hidden="true" />;
}
