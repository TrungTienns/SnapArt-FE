"use client";

import { useEffect, useRef, useState } from "react";
import { en } from "@/locales";

interface StoryReelProps {
  src?: string;
  poster?: string;
  captionsSrc?: string;
  isDemo?: boolean;
}

export function StoryReel({
  src = "/assets/videos/snapart-studio-demo-4k.mp4",
  poster = "/assets/videos/snapart-studio-demo-poster.jpg",
  captionsSrc,
  isDemo = true,
}: StoryReelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const t = en.storyReel;

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const playIfAllowed = () => {
      if (!inViewRef.current || userPausedRef.current || reducedMotion.matches || document.hidden) return;
      void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        section.classList.add("is-visible");
        playIfAllowed();
      } else video.pause();
    }, { threshold: 0.25 });
    const syncPlayback = () => {
      if (document.hidden || reducedMotion.matches) video.pause();
      else playIfAllowed();
    };
    observer.observe(section);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, [src]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || hasError) return;
    if (!video.paused) {
      userPausedRef.current = true;
      video.pause();
    } else {
      userPausedRef.current = false;
      try { await video.play(); } catch { /* Keep the poster when playback is unavailable. */ }
    }
  };

  return (
    <section ref={sectionRef} id="story-reel" data-scroll-snap aria-label={t.filmTitle} className="sr-section sr-cinema">
      <div className="sr-video-wrap">
        <video
          key={src}
          id="snapart-story-film"
          ref={videoRef}
          className={`sr-video${isReady && !hasError ? " is-ready" : ""}`}
          src={src}
          poster={poster}
          aria-label={isDemo ? t.demoTitle : t.filmTitle}
          playsInline loop muted preload="metadata" width={3840} height={2160}
          onLoadStart={() => { setHasError(false); setIsReady(false); }}
          onLoadedData={() => setIsReady(true)}
          onCanPlay={() => setIsReady(true)}
          onPlaying={() => { setIsReady(true); setIsPlaying(true); }}
          onPause={() => setIsPlaying(false)}
          onError={() => { setHasError(true); setIsPlaying(false); }}
        >
          {captionsSrc && <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />}
          {t.unsupported}
        </video>
      </div>
      <div className="sr-editorial-shade" aria-hidden="true" />
      <div className="sr-film-caption">
        <h2 className="sr-film-caption-title"><span className="font-pencil">Our story.</span></h2>
        <p className="sr-film-caption-note font-pencil">A little room for colour.</p>
      </div>
      <button
        type="button"
        className="sr-film-surface"
        aria-label={isPlaying ? t.ctaPause : t.cta}
        aria-controls="snapart-story-film"
        onClick={() => void togglePlayback()}
        disabled={hasError}
      />
      {isDemo && <p className="sr-only">{t.demoLabel}</p>}
      {hasError && <p className="sr-cinema-error" role="status">{t.error}</p>}
    </section>
  );
}
