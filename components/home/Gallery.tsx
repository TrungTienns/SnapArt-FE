"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { galleryPhotos, type GalleryPhoto } from "@/constants/gallery";

const previewPhotos = galleryPhotos.slice(0, 5);
const turnDuration = 900;
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
  commit?: boolean;
};

function settlePage(animation: Animation, commit: boolean) {
  animation.playbackRate = commit ? 1.65 : -1.8;
  animation.play();
}

function BookFan() {
  return (
    <div className="snap-book-fan" aria-hidden="true">
      {galleryPhotos.map((photo, index) => (
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
          sizes="(max-width: 660px) 44vw, (max-width: 1688px) 32vw, 540px"
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
  const [turn, setTurn] = useState<{ to: number; direction: Direction; drag?: PageDrag } | null>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const dragRef = useRef<PageDrag | null>(null);
  const lastPage = previewPhotos.length - 1;
  const rightPage = turn?.direction === 1 ? turn.to : page;
  const leftPage = turn?.direction === -1 ? turn.to : page;
  const leafFront = turn?.direction === -1 ? turn.to : page;
  const leafBack = turn?.direction === 1 ? turn.to : page;

  useLayoutEffect(() => {
    if (!turn || !leaf.current) return;

    const animation = leaf.current.animate(
      [
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(-88deg) rotateX(4deg)", offset: .46 },
        { transform: "rotateY(-180deg)" },
      ],
      {
        duration: turnDuration,
        direction: turn.direction === 1 ? "normal" : "reverse",
        easing: turn.drag ? "linear" : "cubic-bezier(.52,.08,.24,1)",
        fill: "both",
      },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animation.playbackRate > 0) setPage(turn.to);
      setTurn(null);
    };

    if (turn.drag) {
      animation.pause();
      animation.currentTime = turn.drag.progress * turnDuration;
      if (turn.drag.commit !== undefined) settlePage(animation, turn.drag.commit);
    }

    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [turn]);

  const turnPage = (direction: Direction) => {
    const to = page + direction;
    if (turn || dragRef.current || to < 0 || to > lastPage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPage(to);
    } else {
      setTurn({ to, direction });
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
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = drag.startX - event.clientX;

    if (!drag.direction) {
      if (Math.abs(distance) < 10 || Math.abs(distance) <= Math.abs(event.clientY - drag.startY)) return;
      const direction = distance > 0 ? 1 : -1;
      const to = page + direction;
      if (to < 0 || to > lastPage) return;
      drag.direction = direction;
      setTurn({ to, direction, drag });
    }

    drag.progress = Math.max(.001, Math.min(.995, distance * drag.direction / drag.pageWidth));
    if (animationRef.current) animationRef.current.currentTime = drag.progress * turnDuration;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>, allowTurn: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.direction) return;
    drag.commit = allowTurn && drag.progress >= .28;
    if (animationRef.current) settlePage(animationRef.current, drag.commit);
  };

  return (
    <section id="gallery" className="snap-gallery" aria-labelledby="gallery-title">
      <header className="snap-book-heading">
        <h2 id="gallery-title" className="art-kicker">SnapArt / Gallery</h2>
        <p className="font-pencil">a little colour on every page</p>
        <span aria-hidden="true">Vol. 01</span>
      </header>

      <div className="snap-book-stage">
        <BookFan />
        <div
          className="snap-book-object"
          id="gallery-album-pages"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={event => endDrag(event, true)}
          onPointerCancel={event => endDrag(event, false)}
          onLostPointerCapture={event => endDrag(event, false)}
        >
          <div className="snap-book-left">
            <BookPhoto photo={previewPhotos[leftPage]} />
            {!turn && <span className="snap-book-drag-stamp" aria-hidden="true"><span>↔</span> Drag to turn</span>}
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
