"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SunBadge } from "@/components/common/SunBadge";
import { InteractiveCanvasPaper } from "@/components/common/InteractiveCanvasPaper";
import { en } from "@/locales";

const snapArtLetters = [
  { character: "S", color: "var(--color-wordmark-s)" },
  { character: "n", color: "var(--color-wordmark-n)" },
  { character: "a", color: "var(--color-wordmark-a)" },
  { character: "p", color: "var(--color-wordmark-p)" },
  { character: "A", color: "var(--color-wordmark-a-alt)" },
  { character: "r", color: "var(--color-wordmark-r)" },
  { character: "t", color: "var(--color-wordmark-t)" },
] as const;

export function HeroBanner() {
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  /** Ref for the inner canvas paper — drawing is restricted to this area */
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId: number | null = null;

    const updateOnScroll = () => {
      frameId = null;
      const wordmark = wordmarkRef.current;
      const section = sectionRef.current;

      if (!section) return;

      const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));

      // --- Wordmark 3-D rotation (left → right) on scroll ---
      if (wordmark && !reducedMotionQuery.matches) {
        wordmark.style.transform = `rotateY(${progress * 180}deg)`;
      } else if (wordmark) {
        wordmark.style.transform = "none";
      }

      // --- Hero banner fade-out on scroll ---
      if (!reducedMotionQuery.matches) {
        // Fade starts at 0% scroll, fully transparent by 65% of viewport height
        const fadeProgress = Math.min(1, window.scrollY / (window.innerHeight * 0.65));
        const opacity = Math.max(0, 1 - fadeProgress);

        // When fully invisible, set visibility to hidden so GPU skips compositing it completely
        if (opacity <= 0.01) {
          section.style.opacity = "0";
          section.style.visibility = "hidden";
          section.style.pointerEvents = "none";
        } else {
          section.style.opacity = opacity.toFixed(2);
          section.style.visibility = "visible";
          section.style.pointerEvents = "auto";
        }
      }
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateOnScroll);
      }
    };

    updateOnScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    reducedMotionQuery.addEventListener("change", updateOnScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      reducedMotionQuery.removeEventListener("change", updateOnScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-scroll-snap
      className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-4 px-4 md:px-12 overflow-hidden bg-[#e9e3d7]"
    >
      {/*
        AUTHENTIC ARTIST CANVAS / EASEL BOARD CONTAINER
        Mô phỏng tấm toan vải căng khung gỗ thật với vân thớ sợi vải (woven canvas fabric)
        paperRef is attached here — drawing is restricted to this inner area only.
      */}
      <div
        ref={paperRef}
        className="absolute top-3 sm:top-5 md:top-6 left-3 sm:left-5 md:left-8 right-3 sm:right-5 md:right-8 bottom-0 z-0 rounded-t-[24px] md:rounded-t-[36px] rounded-b-none bg-canvas-texture shadow-[0_16px_36px_rgba(65,31,21,0.08),inset_0_0_24px_rgba(65,31,21,0.03)] border-t-[6px] md:border-t-[10px] border-x-[6px] md:border-x-[10px] border-b-0 border-[#d8cfbe] overflow-hidden"
      >

        {/* Subtle Canvas Corner Nails / Brackets (Đinh tán cố định toan vẽ ở các góc) */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-[#bcab94] border border-[#7e6c55]/40 shadow-inner z-10 opacity-70" />
        <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-[#bcab94] border border-[#7e6c55]/40 shadow-inner z-10 opacity-70" />

        {/* Inner Fine Canvas Stitched Border */}
        <div className="absolute top-3 md:top-5 left-3 md:left-5 right-3 md:right-5 bottom-0 border-t border-x border-b-0 border-dashed border-[#411f15]/15 rounded-t-[16px] md:rounded-t-[26px] pointer-events-none z-10" />

        {/* Artist Stamp / Studio Label watermark in bottom right corner */}
        <div className="absolute bottom-4 right-8 md:bottom-5 md:right-12 z-10 pointer-events-none select-none opacity-20 flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-mono font-black uppercase tracking-[0.25em] text-[#411f15]">
            SNAPART • 100% COTTON CANVAS • 380 GSM
          </span>
        </div>
      </div>

      {/* 2. Floating Rotating Badges */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between pointer-events-none mt-4">
        {/* Badge 1: Top-Left "ABOUT US" */}
        <div className="pt-2 pl-4 md:pl-16 animate-sun-badge-left pointer-events-auto">
          <Link href="#about-us" className="inline-block">
            <SunBadge text={en.hero.badgeAbout} spinDirection="normal" />
          </Link>
        </div>

        {/* Badge 2: Mid-Right "CUSTOM ART" */}
        <div className="flex justify-end pr-8 md:pr-24 -mt-6 animate-sun-badge-right pointer-events-auto">
          <Link href="/custom-art" className="inline-block">
            <SunBadge text={en.hero.badgeCustomArt} spinDirection="reverse" />
          </Link>
        </div>
      </div>

      {/* 3. Giant Bottom Typography */}
      <div className="relative z-10 w-full mt-auto flex flex-col items-center text-center pointer-events-none select-none pb-4">
        <h1 className="w-full text-[10vw] sm:text-[9.5vw] md:text-[8.5vw] font-black uppercase tracking-[-0.03em] leading-[0.92] text-[#411f15] select-none text-center animate-title-up flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5">
          <span>{en.hero.titlePrefix}</span>

          {/* Perfectly aligned childlike pencil font with vertical floating animation */}
          <span
            aria-label="SnapArt"
            className="inline-block font-pencil tracking-normal normal-case text-[1.12em] px-2 md:px-3 select-none snapart-wordmark-rotate"
            ref={wordmarkRef}
          >
            {snapArtLetters.map(({ character, color }, index) => (
              <span key={`${character}-${index}`} style={{ color }}>
                {character}
              </span>
            ))}
          </span>

          <span>{en.hero.titleSuffix}</span>
          <br className="w-full basis-full h-0" />
          <span className="w-full block mt-1">{en.hero.titleLine2}</span>
        </h1>

        <p className="mt-4 md:mt-6 text-xs md:text-sm font-extrabold uppercase tracking-[0.14em] text-[#411f15]/80 max-w-3xl px-4 animate-subtitle-up">
          {en.hero.subtitle}
        </p>
      </div>

      {/* 4. Decorative Floating Paint Palette */}
      <div
        title="Custom Art on Demand"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#411f15]/20 shadow-sm cursor-pointer hover:scale-110 transition-transform animate-sun-badge-right pointer-events-auto"
      >
        <span className="text-sm">🎨</span>
      </div>

      {/* 5. DRAWING LAYER — clipped to the inner canvas paper (paperRef) */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <InteractiveCanvasPaper drawAreaRef={paperRef} />
      </div>
    </section>
  );
}
