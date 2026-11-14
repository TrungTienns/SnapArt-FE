"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { galleryPhotos, type GalleryPhoto } from "@/constants/gallery";

const previewPhotos = galleryPhotos.slice(0, 5);
// Keep archive-only images nearest the spread so they differ from the open photo.
const fanPhotos = [5, 1, 2, 0, 6, 4, 7, 3].map(index => galleryPhotos[index]);
const turnDuration = 900;
const turnThreshold = 0.5;
const albumNotes = [
  "Colour always finds a seat.",
  "It starts with a brushstroke.",
  "A little study in colour.",
  "Mix until it feels like yours.",
  "The good part is still happening.",
];

function folio(index: number) {
  return String(index + 1).padStart(2, "0");
}

type Direction = -1 | 1;

type PageDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  pageWidth: number;
  direction?: Direction;
  progress: number;
  committed?: boolean;
};

type PageTurn = {
  to: number;
  direction: Direction;
  drag?: PageDrag;
  destination?: 0 | 1;
};

function drawPage(leaf: HTMLDivElement, progress: number, direction: Direction) {
  const position = direction === 1 ? progress : 1 - progress;
  const flex = Math.sin(Math.PI * position);
  const tilt = Math.sin(2 * Math.PI * position) * flex;

  leaf.style.transform = `rotateY(${-180 * position}deg) skewY(${4 * tilt}deg) scaleX(${1 - 0.09 * flex})`;
  leaf.style.setProperty("--snap-page-flex", String(flex));
}

function BookFan() {
  return (
    <div className="snap-book-fan" aria-hidden="true">
      {fanPhotos.map((photo, index) => (
        <div
          className="snap-book-fan-sheet"
          data-side={index < 4 ? "left" : "right"}
          key={photo.id}
          style={{ "--fan-step": index % 4 + 1 } as CSSProperties}
        >
          <div><Image src={photo.image} alt="" fill sizes="(max-width: 660px) 30vw, 320px" draggable={false} /></div>
        </div>
      ))}
    </div>
  );
}

function BookPhoto({ photo }: { photo: GalleryPhoto }) {
  return (
    <figure className="snap-book-photo">
      <div>
        <Image
          src={photo.image}
          alt={photo.alt}
          fill
          sizes="(max-width: 660px) 45vw, (max-width: 1500px) 34vw, 510px"
          placeholder={typeof photo.image === "string" ? "empty" : "blur"}
          draggable={false}
        />
      </div>
    </figure>
  );
}

function BookText({ index, moving = false }: { index: number; moving?: boolean }) {
  return (
    <div className="snap-book-text">
      <p className="snap-book-page-number">{folio(index)} <span>—</span> {folio(previewPhotos.length - 1)}</p>
      <div className="snap-book-page-heading">
        <p className="snap-book-photo-title">{previewPhotos[index].title}</p>
        <p className="snap-book-photo-note font-pencil">{albumNotes[index]}</p>
      </div>
      {moving ? <span className="snap-gallery-more">More info <span>→</span></span> : (
        <Link className="snap-gallery-more" href="/gallery">More info <span aria-hidden="true">→</span></Link>
      )}
    </div>
  );
}

export function Gallery() {
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const dragRef = useRef<PageDrag | null>(null);
  const lastPage = previewPhotos.length - 1;
  const rightPage = turn?.direction === 1 ? turn.to : page;
  const leftPage = turn?.direction === -1 ? turn.to : page;
  const leafFront = turn?.direction === -1 ? turn.to : page;
  const leafBack = turn?.direction === 1 ? turn.to : page;

  useLayoutEffect(() => {
    const sheet = leaf.current;
    if (!turn || !sheet) return;

    const { drag, destination, direction, to } = turn;
    const start = drag?.progress ?? 0;
    drawPage(sheet, start, direction);
    if (destination === undefined) return;

    const distance = destination - start;
    const duration = drag ? 300 + 300 * Math.abs(distance) : turnDuration;
    const startedAt = performance.now();
    let frame: number;

    const advance = (now: number) => {
      const time = Math.min(1, (now - startedAt) / duration);
      const eased = drag ? 1 - (1 - time) ** 3 : (1 - Math.cos(Math.PI * time)) / 2;
      drawPage(sheet, start + distance * eased, direction);

      if (time < 1) {
        frame = requestAnimationFrame(advance);
      } else {
        if (destination === 1) setPage(to);
        setTurn(null);
      }
    };

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [turn]);

  const turnPage = (direction: Direction) => {
    const to = page + direction;
    if (turn || dragRef.current || to < 0 || to > lastPage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPage(to);
    } else {
      setTurn({ to, direction, destination: 1 });
    }
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (turn || dragRef.current || !event.isPrimary || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      pageWidth: event.currentTarget.clientWidth / 2,
      progress: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.committed) return;
    const distance = drag.startX - event.clientX;

    if (!drag.direction) {
      if (Math.abs(distance) < 10 || Math.abs(distance) <= Math.abs(event.clientY - drag.startY)) return;
      const direction = distance > 0 ? 1 : -1;
      const to = page + direction;
      if (to < 0 || to > lastPage) return;
      drag.direction = direction;
      setTurn({ to, direction, drag });
    }

    drag.progress = Math.max(0, Math.min(turnThreshold, distance * drag.direction / drag.pageWidth));
    if (leaf.current) drawPage(leaf.current, drag.progress, drag.direction);

    if (drag.progress >= turnThreshold) {
      drag.committed = true;
      setTurn(current => current?.drag === drag ? { ...current, destination: 1 } : current);
    }
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.direction && !drag.committed) {
      setTurn(current => current?.drag === drag ? { ...current, destination: 0 } : current);
    }
  };

  return (
    <section id="gallery" className="snap-gallery" aria-labelledby="gallery-title">
      <header className="snap-book-heading">
        <div>
          <p className="art-kicker">SnapArt / Gallery</p>
          <h2 id="gallery-title">The studio album</h2>
        </div>
        <p className="snap-book-marginalia font-pencil">a little colour on every page</p>
      </header>

      <div className="snap-book-stage">
        <BookFan />
        <div
          className="snap-book-object"
          id="gallery-album-pages"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <div className="snap-book-left">
            <BookPhoto photo={previewPhotos[leftPage]} />
          </div>
          <div className="snap-book-right" inert={!!turn}>
            <BookText index={rightPage} />
          </div>

          {turn && (
            <div
              className="snap-book-leaf"
              ref={leaf}
              aria-hidden="true"
            >
              <div className="snap-book-face snap-book-face-front">
                <BookText index={leafFront} moving />
              </div>
              <div className="snap-book-face snap-book-face-back">
                <BookPhoto photo={previewPhotos[leafBack]} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="snap-book-footer" role="group" aria-label="Album pages">
        <button type="button" disabled={page <= 0} aria-disabled={!!turn || undefined} aria-controls="gallery-album-pages" onClick={() => turnPage(-1)}>← Previous</button>
        <span role="status" aria-label={`Photo ${page + 1} of ${previewPhotos.length}`}>
          {folio(page)} — {folio(lastPage)}
        </span>
        <button type="button" disabled={page === lastPage} aria-disabled={!!turn || undefined} aria-controls="gallery-album-pages" onClick={() => turnPage(1)}>Next →</button>
      </div>
    </section>
  );
}
