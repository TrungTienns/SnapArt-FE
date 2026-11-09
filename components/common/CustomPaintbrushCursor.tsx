"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function CustomPaintbrushCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const brushIconRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetPosRef = useRef({ x: -100, y: -100 });
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run on devices with a fine pointer (mouse / trackpad)
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cursorEl = cursorRef.current;
    const brushEl = brushIconRef.current;
    if (!cursorEl || !brushEl) return;

    let isTicking = false;

    const render = () => {
      posRef.current.x = targetPosRef.current.x;
      posRef.current.y = targetPosRef.current.y;

      cursorEl.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;

      isTicking = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPosRef.current.x = e.clientX;
      targetPosRef.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        cursorEl.style.opacity = "1";
      }

      if (!isTicking) {
        isTicking = true;
        rafIdRef.current = requestAnimationFrame(render);
      }

      // Check clickable targets without traversing on every single move if target hasn't changed
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest("a, button, [role='button'], input, [tabindex]")
        );

        if (isClickable !== isHoveringRef.current) {
          isHoveringRef.current = isClickable;
          if (isClickable) {
            brushEl.style.transform = "scale(1.25) rotate(12deg)";
          } else {
            brushEl.style.transform = "scale(1) rotate(0deg)";
          }
        }
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursorEl.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursorEl.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="snapart-custom-cursor fixed top-0 left-0 pointer-events-none z-[9999] select-none opacity-0 will-change-transform"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
      }}
    >
      {/* Tip of brush is located precisely at (0, 0) */}
      <div
        ref={brushIconRef}
        className="relative -top-2 -left-2 transition-transform duration-150 ease-out will-change-transform"
        style={{ transformOrigin: "0% 0%" }}
      >
        <Image
          src="/assets/icons/paintbrush-cursor.svg"
          alt="Paintbrush Cursor"
          width={44}
          height={44}
          priority
          className="w-11 h-11 drop-shadow-md select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
