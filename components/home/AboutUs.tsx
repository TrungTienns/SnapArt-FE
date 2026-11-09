"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { en } from "@/locales";

function TitleLine({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`about-us-line ${className}`}>
      <span>{children}</span>
    </span>
  );
}

function AboutBlob({ layer }: { layer: "back" | "front" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      className={layer === "back" ? "about-us-blob about-us-blob-back" : "about-us-blob about-us-blob-front"}
    >
      {layer === "back" ? (
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M0 0h1440v900H0z
            M180 70c130-58 310-8 430 8 155 22 280-70 470-8 120 40 250 95 250 210 0 95-70 150-40 250 40 130-70 250-230 250-125 0-175-95-310-95-150 0-185 120-350 110-175-10-250-140-250-250 0-95 55-145 20-250C110 185 70 120 180 70z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M0 710c110-8 160-80 300-52 150 30 170 95 330 72 165-24 190-110 350-78 130 26 160 88 280 70 80-12 130-40 180-8v186H0V710z"
        />
      )}
    </svg>
  );
}

export function AboutUs() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) {
      section.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-us"
      data-scroll-snap
      aria-labelledby="about-us-title"
      className="about-us-section relative bg-[var(--color-surface-muted)]"
    >
      <div className="about-us-stage">
        <AboutBlob layer="back" />

        <h2 id="about-us-title" className="about-us-display" aria-label={`${en.aboutUs.land} ${en.aboutUs.title}`}>
          <TitleLine className="about-us-line-1">{en.aboutUs.land}</TitleLine>
          <Link href="/about" className="about-us-title-link" aria-label="About SnapArt — meet the studio">
            <TitleLine className="about-us-line-2">{en.aboutUs.title}</TitleLine>
          </Link>
        </h2>

        <div className="about-us-mascot">
          <Image
            src="/assets/icons/sun-character.svg"
            alt=""
            width={160}
            height={160}
            className="about-us-mascot-image"
          />
        </div>

        <p className="about-us-intro">{en.aboutUs.intro}</p>
        <p aria-hidden="true" className="about-us-script font-pencil">
          {en.aboutUs.script}
        </p>

        <AboutBlob layer="front" />
      </div>

    </section>
  );
}
