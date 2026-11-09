"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AboutUs } from "@/components/home/AboutUs";
import { HeroBanner } from "@/components/home/HeroBanner";
import { StoryReel } from "@/components/home/StoryReel";
import { ArtWall } from "@/components/home/ArtWall";

import { MeetStudio } from "@/components/home/MeetStudio";
import { en } from "@/locales";

export default function Home() {
  const [cookieAccepted, setCookieAccepted] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#f6f6f6] text-[#411f15] overflow-x-hidden flex flex-col justify-between select-none">
      {/* Navigation Header */}
      <Header />

      {/* Hero Banner Component */}
      <main className="relative flex-1 w-full">
        <HeroBanner />
        <AboutUs />
        <ArtWall />

        {/* ── Story Reel: Inspirational origin video section ── */}
        <StoryReel />

        <MeetStudio />

        {/* Cookie Banner */}
        {!cookieAccepted && (
          <aside
            aria-label="Cookie consent banner"
            className="fixed bottom-4 right-4 md:bottom-6 md:right-8 z-50 flex items-center rounded-full bg-[#f2b8cb] text-[#411f15] border border-[#411f15]/20 shadow-lg px-4 py-2 text-[11px] md:text-xs font-bold gap-3 animate-cookie-in"
          >
            <span>
              {en.cookie.text}{" "}
              <Link href="/cookies" className="underline underline-offset-2 hover:opacity-75">
                {en.cookie.readMore}
              </Link>
            </span>
            <button
              type="button"
              onClick={() => setCookieAccepted(true)}
              className="bg-[#000000] text-white hover:bg-[#411f15] transition-colors rounded-full px-3 py-1 font-extrabold uppercase text-[10px] tracking-wider cursor-pointer"
            >
              {en.cookie.accept}
            </button>
          </aside>
        )}
      </main>
    </div>
  );
}
