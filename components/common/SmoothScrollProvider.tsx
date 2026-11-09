"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = navigation?.type === "reload";
    const previousRestoration = history.scrollRestoration;
    if (isReload) {
      history.scrollRestoration = "manual";
      // A retained section fragment would otherwise jump back down after refresh.
      if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const panelMotion = { panelSnap: true };
    let panelSettledAt = -Infinity;
    let panelDirection = 0;
    const isPanelMoving = () => lenis.isScrolling === "smooth" && lenis.userData === panelMotion;
    // Zero velocity and acceleration at both ends avoids an abrupt section jump.
    const sectionEasing = (t: number) => t * t * t * (10 + t * (-15 + 6 * t));

    const navigatePanel = (direction: number, distance: number) => {
      if (reducedMotion.matches || document.fullscreenElement) return false;
      const panels = Array.from(document.querySelectorAll<HTMLElement>("main > section, main > footer"));
      const y = window.scrollY;
      const viewport = window.innerHeight;
      const activeIndex = panels.findIndex(panel => {
        const top = panel.getBoundingClientRect().top + y;
        return y >= top - 3 && y < top + panel.offsetHeight - 3;
      });
      if (activeIndex < 0) return false;
      const active = panels[activeIndex];
      const top = active.getBoundingClientRect().top + y;
      const end = Math.max(top, top + active.offsetHeight - viewport);
      let target: number | undefined;

      if (active.hasAttribute("data-scroll-snap")) {
        if (direction > 0) {
          if (y < end - 4) {
            if (y + distance >= end) target = end;
          } else {
            const next = panels[activeIndex + 1];
            if (next) target = next.getBoundingClientRect().top + y;
          }
        } else if (y > top + 4) {
          if (y - distance <= top) target = top;
        } else {
          const previous = panels[activeIndex - 1];
          if (previous) {
            const previousTop = previous.getBoundingClientRect().top + y;
            target = Math.max(previousTop, previousTop + previous.offsetHeight - viewport);
          }
        }
      } else {
        // Catch entry into a snapping panel without constraining long galleries.
        const neighbour = panels[activeIndex + direction];
        if (neighbour?.hasAttribute("data-scroll-snap")) {
          const neighbourTop = neighbour.getBoundingClientRect().top + y;
          const boundary = direction > 0 ? neighbourTop : Math.max(neighbourTop, neighbourTop + neighbour.offsetHeight - viewport);
          if ((direction > 0 && y + distance >= boundary) || (direction < 0 && y - distance <= boundary)) target = boundary;
        }
      }
      if (target === undefined || Math.abs(target - y) < 2) return false;
      panelDirection = direction;
      const travel = Math.abs(target - y) / viewport;
      const duration = Math.min(1.65, Math.max(0.8, 1.35 * Math.sqrt(travel)));
      lenis.scrollTo(target, {
        duration,
        easing: sectionEasing,
        force: true,
        userData: panelMotion,
        onComplete: () => { panelSettledAt = performance.now(); },
      });
      return true;
    };

    const lenis: Lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: !reducedMotion.matches,
      touchMultiplier: 1,
      anchors: { duration: 1.35, easing: sectionEasing },
      virtualScroll: ({ deltaX, deltaY, event }) => {
        if (reducedMotion.matches || !(event instanceof WheelEvent) || event.ctrlKey || Math.abs(deltaX) > Math.abs(deltaY) || deltaY === 0) return true;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("input, textarea, select, [contenteditable], [data-lenis-prevent]")) return true;
        const direction = Math.sign(deltaY);
        // Ignore the brief momentum tail without extending the lock on every wheel event.
        const settling = direction === panelDirection && performance.now() - panelSettledAt < 140;
        const captured = isPanelMoving() || settling || navigatePanel(direction, Math.abs(deltaY));
        if (captured && event.cancelable) event.preventDefault();
        return !captured;
      },
    });

    const resetAfterReload = () => {
      if (isReload) lenis.scrollTo(0, { immediate: true, force: true });
    };
    resetAfterReload();
    window.addEventListener("load", resetAfterReload, { once: true });

    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if ((event.target as Element | null)?.closest("input, textarea, select, button, a, [contenteditable], video, [data-lenis-prevent]")) return;
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key) ? (event.shiftKey ? -1 : 1) : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (!direction) return;
      if (isPanelMoving() || navigatePanel(direction, window.innerHeight)) event.preventDefault();
    };
    window.addEventListener("keydown", handleKey);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("load", resetAfterReload);
      history.scrollRestoration = previousRestoration;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
