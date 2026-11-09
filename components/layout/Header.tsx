"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { en } from "@/locales";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    const update = () => {
      frame = null;
      const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.65)));
      const focused = header.contains(document.activeElement);
      const opacity = focused ? 1 : reducedMotion.matches ? (progress >= 1 ? 0 : 1) : 1 - progress;
      const hidden = opacity <= 0.01;
      header.style.opacity = opacity.toFixed(3);
      header.style.visibility = hidden ? "hidden" : "visible";
      header.style.pointerEvents = hidden ? "none" : "auto";
      header.inert = hidden;
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    header.addEventListener("focusin", scheduleUpdate);
    header.addEventListener("focusout", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      header.removeEventListener("focusin", scheduleUpdate);
      header.removeEventListener("focusout", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 text-[#411f15] bg-[#f6f6f6]/80 backdrop-blur-md">
      {/* Left: Brand Logo SVG + Language Toggle */}
      <div className="flex items-center gap-6">
        <Link href="/" className="group flex items-center">
          <Image
            src="/assets/logos/logo.svg"
            alt="SnapArt Logo"
            width={120}
            height={120}
            priority
            className="h-11 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>
        <div className="hidden sm:flex items-center text-xs font-bold tracking-wider">
          <span className="cursor-pointer border-b border-[#411f15] pb-0.5">ENG</span>
          <span className="mx-1.5 opacity-40">|</span>
          <span className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" title="Vietnamese coming soon">VIE</span>
        </div>
      </div>

      {/* Center: Social Handle */}
      <div className="hidden lg:flex items-center">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold tracking-widest uppercase hover:underline"
        >
          {en.header.social}
        </a>
      </div>

      {/* Right: Search, Navigation, Custom Action */}
      <div className="flex items-center gap-6 md:gap-8">
        <button
          type="button"
          aria-label="Search workshops or custom art"
          className="hover:scale-110 transition-transform p-1 cursor-pointer"
        >
          <Search className="w-5 h-5 text-[#411f15]" strokeWidth={2.2} />
        </button>

        <nav className="flex items-center gap-5 md:gap-7 text-xs md:text-sm font-extrabold tracking-wider uppercase">
          <Link href="/workshops" className="hover:opacity-70 transition-opacity">
            {en.header.nav.workshops}
          </Link>
          <Link href="/custom-art" className="hover:opacity-70 transition-opacity text-[#411f15]">
            <span className="relative">
              {en.header.nav.customArt}
              <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-[#f2b8cb] rounded-full"></span>
            </span>
          </Link>
          <Link href="/gallery" className="hidden sm:inline-block hover:opacity-70 transition-opacity">
            {en.header.nav.gallery}
          </Link>
          <Link href="/about" className="hidden md:inline-block hover:opacity-70 transition-opacity">
            {en.header.nav.aboutUs}
          </Link>
        </nav>

        {/* Artistic Flower Icon (Symbolizes paint palette & creative bloom) */}
        <Link
          href="/workshops"
          title="Explore Workshops"
          aria-label="Explore Workshops"
          className="hover:rotate-90 transition-transform duration-700 ease-in-out cursor-pointer"
        >
          <svg
            className="w-8 h-8 text-[#411f15]"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 8C16 4 14 2 12 3C10 4 12 8 16 8Z" />
            <path d="M16 8C16 4 18 2 20 3C22 4 20 8 16 8Z" />
            <path d="M16 24C16 28 14 30 12 29C10 28 12 24 16 24Z" />
            <path d="M16 24C16 28 18 30 20 29C22 28 20 24 16 24Z" />
            <path d="M8 16C4 16 2 14 3 12C4 10 8 12 8 16Z" />
            <path d="M8 16C4 16 2 18 3 20C4 22 8 20 8 16Z" />
            <path d="M24 16C28 16 30 14 29 12C28 10 24 12 24 16Z" />
            <path d="M24 16C28 16 28 18 29 20C28 22 24 20 24 16Z" />
            <circle cx="16" cy="16" r="2.5" fill="#411f15" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
