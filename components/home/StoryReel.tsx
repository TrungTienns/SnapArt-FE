"use client";

import { useEffect, useRef, useState } from "react";
import { en } from "@/locales";
import Image from "next/image";
import { StudioStudy } from "./ArtWall";

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
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const inViewRef = useRef(false);
  const userPausedRef = useRef(false);
  const captureFrameRef = useRef<(() => void) | null>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const storyButtonRef = useRef<HTMLButtonElement>(null);
  const resumeAfterStoryRef = useRef(false);
  const storyWasOpenRef = useRef(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const t = en.storyReel;

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let mergeFrame = 0;
    let mergeStarted = false;
    let mergeFinished = false;
    const mergeDuration = 1350;
    const fallback = new window.Image();
    fallback.src = poster;
    section.classList.add("sr-merge-enabled");
    const finishMerge = () => {
      mergeFinished = true;
      cancelAnimationFrame(mergeFrame);
      section.classList.add("is-assembled");
      section.classList.remove("is-merging");
    };
    const drawFrame = () => {
      const left = leftCanvasRef.current;
      const right = rightCanvasRef.current;
      if (!left || !right) return;
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      const source = video.readyState >= 2 ? video : fallback;
      const sw = source === video ? video.videoWidth : fallback.naturalWidth;
      const sh = source === video ? video.videoHeight : fallback.naturalHeight;
      if (!sw || !sh) return;
      const scale = Math.max(width / sw, height / sh);
      for (const canvas of [left, right]) {
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        canvas.getContext("2d")?.drawImage(source, (width - sw * scale) * (rect.width <= 600 ? 0.66 : 0.65), (height - sh * scale) * 0.5, sw * scale, sh * scale);
      }
    };
    captureFrameRef.current = drawFrame;
    const beginMerge = () => {
      if (mergeStarted || mergeFinished || !inViewRef.current) return;
      if (reducedMotion.matches) { finishMerge(); return; }
      const left = leftCanvasRef.current;
      const right = rightCanvasRef.current;
      if (!left || !right) { finishMerge(); return; }
      if (video.readyState < 2 && !fallback.naturalWidth) return;
      mergeStarted = true;
      const start = performance.now();
      const paint = () => {
        drawFrame();
        if (performance.now() - start >= mergeDuration) finishMerge();
        else mergeFrame = requestAnimationFrame(paint);
      };
      paint();
      section.classList.add("is-merging");
    };
    fallback.addEventListener("load", beginMerge);
    fallback.addEventListener("error", finishMerge);
    video.addEventListener("loadeddata", beginMerge);
    video.addEventListener("error", finishMerge);
    const playIfAllowed = () => {
      if (!inViewRef.current || userPausedRef.current || reducedMotion.matches || document.hidden) return;
      // Browsers may require a gesture; the full film surface remains operable.
      void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        section.classList.add("is-visible");
        beginMerge();
        playIfAllowed();
      } else video.pause();
    }, { threshold: 0.25 });
    const syncPlayback = () => {
      if (reducedMotion.matches) finishMerge();
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
      fallback.removeEventListener("load", beginMerge);
      fallback.removeEventListener("error", finishMerge);
      video.removeEventListener("loadeddata", beginMerge);
      video.removeEventListener("error", finishMerge);
      cancelAnimationFrame(mergeFrame);
      captureFrameRef.current = null;
      section.classList.remove("sr-merge-enabled", "is-merging", "is-assembled");
      video.pause();
    };
  }, [src, poster]);

  useEffect(() => {
    if (isStoryOpen && journeyRef.current) {
      journeyRef.current.scrollTop = 0;
      journeyRef.current.focus({ preventScroll: true });
    }
    else if (storyWasOpenRef.current) storyButtonRef.current?.focus({ preventScroll: true });
    storyWasOpenRef.current = isStoryOpen;
  }, [isStoryOpen]);

  const openStory = () => {
    captureFrameRef.current?.();
    resumeAfterStoryRef.current = Boolean(videoRef.current && !videoRef.current.paused);
    userPausedRef.current = true;
    videoRef.current?.pause();
    setIsStoryOpen(true);
  };

  const closeStory = () => {
    if (!isClosing) setIsClosing(true);
  };

  useEffect(() => {
    if (!isClosing) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => {
      setIsStoryOpen(false);
      setIsClosing(false);
      userPausedRef.current = !resumeAfterStoryRef.current;
      if (resumeAfterStoryRef.current && inViewRef.current && !reducedMotion) void videoRef.current?.play().catch(() => {});
    }, reducedMotion ? 0 : 1100);
    return () => window.clearTimeout(timeout);
  }, [isClosing]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || hasError) return;
    if (!video.paused) {
      userPausedRef.current = true;
      video.pause();
    } else {
      userPausedRef.current = false;
      try { await video.play(); } catch { /* Keep the poster if playback is unavailable. */ }
    }
  };

  return (
    <section ref={sectionRef} id="story-reel" data-scroll-snap aria-labelledby={isStoryOpen ? "journey-title" : "story-reel-title"} className={`sr-section sr-cinema${isStoryOpen ? " is-story-open" : ""}${isClosing ? " is-story-closing" : ""}`}>
      <div className="sr-video-wrap">
        <div className="sr-poster" aria-hidden="true" />
        <video
          id="snapart-story-film"
          ref={videoRef}
          className={`sr-video${isReady && !hasError ? " is-ready" : ""}`}
          src={src}
          poster={poster}
          aria-label={isDemo ? t.demoTitle : t.filmTitle}
          playsInline loop muted preload="metadata" width={3840} height={2160}
          onLoadedData={() => setIsReady(true)}
          onCanPlay={() => setIsReady(true)}
          onPlaying={() => { setIsReady(true); setIsPlaying(true); }}
          onPause={() => setIsPlaying(false)}
          onError={() => { setHasError(true); setIsPlaying(false); }}
        >
          {captionsSrc && <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />}
          {t.unsupported}
        </video>
        <div className="sr-merge-layer" aria-hidden="true">
          <div className="sr-merge-half sr-merge-left"><canvas ref={leftCanvasRef} /></div>
          <div className="sr-merge-half sr-merge-right"><canvas ref={rightCanvasRef} /></div>
        </div>
      </div>
      <div className="sr-grain" aria-hidden="true" />
      <div className="sr-scrim" aria-hidden="true" />
      <svg className="sr-edge" viewBox="0 0 1440 22" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h1440v6c-111 7-182-4-271 1-109 7-157 3-249 0-108-4-208 7-316 4C406 4 203 18 0 9Z" fill="currentColor" />
      </svg>
      <button
        type="button"
        className="sr-film-surface"
        aria-label={isPlaying ? t.ctaPause : t.cta}
        aria-controls="snapart-story-film"
        onClick={() => void togglePlayback()}
        disabled={hasError || isStoryOpen}
      />
      <div className="sr-cinema-title-wrap">
        <svg className="sr-cinema-drawing" viewBox="0 0 1000 650" fill="none" aria-hidden="true">
          <g className="sr-cinema-flower" transform="translate(805 145) rotate(17)" stroke="currentColor" strokeWidth="1.6">
            <path d="M0-9C-38-76 30-90 9-10C72-52 91 9 12 8C75 55 13 88 2 15C-24 88-77 43-12 7C-86 13-67-53-9-8Z" />
            <path d="M-4-7C11-15 18 8 4 12C-11 15-18-2-4-7Z" />
          </g>
          <path className="sr-cinema-pencil" pathLength="1" d="M298 504C421 550 571 527 682 479M315 517C428 549 530 545 603 521" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="m190 255-7-14m-9 36-15-2m33 28-9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h2 id="story-reel-title" className="sr-cinema-title" aria-label={t.cinemaTitle}>
          <button ref={storyButtonRef} type="button" className="sr-story-button" aria-expanded={isStoryOpen} aria-controls="snapart-journey" aria-label={t.openStory} onClick={openStory}>
            <span aria-hidden="true">The Story</span>
            <span aria-hidden="true" className="sr-cinema-script font-pencil">Of Us</span>
            <span className="sr-story-invitation" aria-hidden="true">Click to unfold our story <span>↗</span></span>
            <svg className="sr-story-stitch" viewBox="0 0 240 20" fill="none" aria-hidden="true"><path d="M4 12c61 12 156-12 232-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 7" /></svg>
          </button>
        </h2>
      </div>
      <article id="snapart-journey" ref={journeyRef} tabIndex={-1} hidden={!isStoryOpen} data-lenis-prevent className="sr-journey" aria-labelledby="journey-title" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); closeStory(); } }}>
        <div className="sr-journey-toolbar"><span>SNAPART / THE STORY OF US</span><button type="button" disabled={isClosing} onClick={closeStory} aria-label={t.closeStory}>{t.backToFilm} <span aria-hidden="true">×</span></button></div>
        <div className="sr-journey-page">
          <p className="font-pencil sr-journey-note">{t.journeyNote}</p>
          <h2 id="journey-title" className="sr-journey-title">{t.journeyTitle}</h2>
          <div className="sr-journey-board">
            {t.journey.map((chapter, index) => <figure className={`sr-memory sr-memory-${index + 1}`} key={chapter.title}>
              <div className="sr-memory-image">
                {index < 2 ? <Image src={index === 0 ? "/assets/videos/snapart-studio-demo-poster.jpg" : "/assets/images/snapart-story-mood.jpg"} alt={index === 0 ? "An artist at work in a studio — illustrative stock photo" : "Paintbrush and textured colour — generated illustration"} width={index === 0 ? 1280 : 1672} height={index === 0 ? 720 : 941} sizes="(max-width: 600px) 42vw, 340px" /> : <StudioStudy study={index - 2} />}
              </div>
              <figcaption><span className="sr-memory-number font-pencil" aria-hidden="true">0{index + 1}</span><h3>{chapter.title}</h3><p>{chapter.body}</p></figcaption>
            </figure>)}
          </div>
        </div>
      </article>
      <div className="sr-print-corner sr-print-corner-top" aria-hidden="true" />
      <div className="sr-print-corner sr-print-corner-bottom" aria-hidden="true" />
      <svg className="sr-pigment-mark" viewBox="0 0 150 100" aria-hidden="true"><path d="M3 45C35 21 84 40 130 8l-7 16 22-3-18 18 19-2-33 27 10 4-44 14 6 8C43 84 18 99 3 80l14-12L0 64l15-9Z" fill="currentColor" /></svg>
      {isDemo && <p className="sr-only">{t.demoLabel}</p>}
      {hasError && <p className="sr-cinema-error" role="status">{t.error}</p>}
    </section>
  );
}
