"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import snapartStudio from "@/public/assets/images/snapart1.jpg";
import snapartLounge from "@/public/assets/images/snapart2.jpg";
import snapartProduct from "@/public/assets/images/snapart3.jpeg";

const studioPhotoSizes = "(max-width: 600px) 74vw, (max-width: 1200px) 30vw, 330px";

const studioPhotos = [
  {
    image: snapartStudio,
    alt: "SnapArt studio painting table with flowers and easels",
    caption: "Flowers, with feeling.",
    noteTitle: "Make it easier to begin.",
    note: "A blank canvas can feel like a test. A small practice card gives everyone room to try a brushstroke and mix a colour before starting their piece.",
    nextStep: "Set a practice card and two colours at each seat. At the end, ask which first step helped people get going.",
  },
  {
    image: snapartLounge,
    alt: "SnapArt lounge with a sofa beneath the studio logo",
    caption: "A face. A thousand stories.",
    noteTitle: "Leave room to linger.",
    note: "Some of the best conversations happen after the brushes go down. Leave a few minutes for people to share what surprised them, show each other their work, or just sit together.",
    nextStep: "Leave one question by the sofa: What helped you feel at home today? Use the answers to welcome the next group.",
  },
  {
    image: snapartProduct,
    alt: "A workshop participant holding a framed seashell artwork",
    caption: "Still life, full of life.",
    noteTitle: "Keep a record of the making.",
    note: "A finished piece hides the small decisions that made it. Keep a photo of a colour test, a rearranged pattern, or a moment when an idea took a new direction.",
    nextStep: "Add one photo and one sentence to the studio notebook after each workshop. Revisit the notes when planning the next session.",
  },
];

export function StudioStudy({ study, landscape = false }: { study: number; landscape?: boolean }) {
  return (
    <svg viewBox="0 0 360 460" preserveAspectRatio={landscape ? "xMidYMid slice" : "xMidYMid meet"} role="img" aria-label={["An expressive cobalt vase with pink flowers", "An abstract portrait in rose and espresso", "A playful still life of fruit and a striped table"][study]}>
      {study === 0 ? <>
        <path fill="#e9b4c0" d="M0 0h360v460H0z" />
        <path d="M0 367q180-65 360 0v93H0Z" fill="#f5e6ce" />
        <path d="m150 255-14-130m44 124 24-151m-12 158 82-96" stroke="#3c743d" strokeWidth="7" fill="none" />
        {[[133,119],[207,96],[272,150]].map(([x,y]) => <g key={x} transform={`translate(${x} ${y})`} fill="#f2b8cb"><ellipse rx="18" ry="42" /><ellipse rx="18" ry="42" transform="rotate(60)" /><ellipse rx="18" ry="42" transform="rotate(120)" /><circle r="13" fill="#411f15" /></g>)}
        <path d="M108 242q75-22 142 0l-18 112q-54 37-107-3Z" fill="#176b9a" />
        <path d="M126 256q45 12 101 0m-95 27q40 13 89 0m-83 29q34 13 75 0" stroke="#f7f4ed" strokeWidth="3" fill="none" />
      </> : study === 1 ? <>
        <path fill="#ffd7e4" d="M0 0h360v460H0z" />
        <path d="M43 460q0-146 141-146t143 146" fill="#ad3d70" />
        <path d="M79 169Q58 42 177 47q129-8 113 142l-29 137H99Z" fill="#411f15" />
        <path d="M112 133q58-40 127 0l-8 127q-42 67-92 3Z" fill="#e9b4c0" />
        <path d="M157 150q-14 1-16 10m63-10q14-3 18 8m-45-2-12 53 22 1m-25 26q25 20 44-1" stroke="#411f15" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="m66 99 61-55m113 18 54 52" stroke="#f7f4ed" strokeWidth="3" />
        <circle cx="110" cy="234" r="15" fill="#176b9a" /><circle cx="239" cy="234" r="15" fill="#176b9a" />
      </> : <>
        <path fill="#1f7568" d="M0 0h360v460H0z" />
        <path d="M0 238h360v222H0Z" fill="#f7f4ed" />
        {[20,75,130,185,240,295,350].map(x => <path key={x} d={`M${x} 238v222`} stroke="#bd3d55" strokeWidth="24" />)}
        <ellipse cx="177" cy="314" rx="143" ry="57" fill="#411f15" />
        <ellipse cx="177" cy="305" rx="134" ry="48" fill="#f4efe6" />
        <path d="M75 288c-23-54 50-87 79-31 17-50 72-18 57 25-29 56-101 48-136 6" fill="#f2b8cb" />
        <path d="M208 295c-28-41 1-91 43-68s42 79 6 91Z" fill="#bd3d55" />
        <path d="m250 236 4-28m-135 51-8-28" stroke="#411f15" strokeWidth="5" />
        <path d="M49 113q89-60 160-8m-131 29q65-37 112-15" stroke="#ffd7e4" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>}
    </svg>
  );
}

export function ArtWall() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const activePhoto = activeIndex === null ? null : studioPhotos[activeIndex];

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const sheet = sheetRef.current;
    const flip = flipRef.current;
    const frame = openerRef.current?.closest("figure");
    if (activeIndex === null || !dialog || !sheet || !flip || !frame || dialog.open) return;

    const origin = getPrintPose(frame);
    dialog.style.setProperty("--studio-frame-ratio", String(frame.offsetWidth / frame.offsetHeight));
    dialog.showModal();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timing = { duration: 880, easing: "cubic-bezier(.24,.66,.3,1)" };

    animationsRef.current = [
      sheet.animate([{ transform: photoFrameTransform(origin, dialog, sheet) }, { transform: "none" }], timing),
      flip.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(180deg)" }], timing),
    ];
    return () => {
      animationsRef.current.forEach(animation => animation.cancel());
      animationsRef.current = [];
    };
  }, [activeIndex]);

  const returnPhoto = () => {
    const dialog = dialogRef.current;
    const sheet = sheetRef.current;
    const flip = flipRef.current;
    const frame = openerRef.current?.closest("figure");
    if (!dialog?.open || dialog.hasAttribute("data-closing")) return;
    if (!sheet || !flip || !frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }

    // Start from the visible pose if the user closes while the photo is still opening.
    const sheetTransform = getComputedStyle(sheet).transform;
    const flipTransform = getComputedStyle(flip).transform;
    const frameTransform = photoFrameTransform(getPrintPose(frame), dialog, sheet);
    animationsRef.current.forEach(animation => animation.cancel());
    dialog.setAttribute("data-closing", "");

    const timing: KeyframeAnimationOptions = { duration: 760, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" };
    const travel = sheet.animate([{ transform: sheetTransform }, { transform: frameTransform }], timing);
    animationsRef.current = [
      travel,
      flip.animate([{ transform: flipTransform }, { transform: "rotateY(0deg)" }], timing),
    ];
    travel.onfinish = () => dialog.close();
  };

  return (
    <section id="studio-studies" className="art-wall" aria-labelledby="art-wall-title">
      <div className="art-wall-heading">
        <p className="art-kicker">From the studio / A few colourful possibilities</p>
        <h2 id="art-wall-title">A little less perfect.<br /><span className="font-pencil">A little more you.</span></h2>
        <p className="art-wall-turn-hint font-pencil">Turn a print to find a note ↷</p>
      </div>
      <div className="art-wall-gallery">
        {studioPhotos.map(({ image, alt, caption }, index) => (
          <figure className={`studio-study studio-study-${index + 1}`} data-active={activeIndex === index || undefined} key={caption}>
            <button
              type="button"
              className="studio-study-trigger"
              aria-haspopup="dialog"
              aria-label={`Read the note behind ${caption}`}
              onClick={event => {
                openerRef.current = event.currentTarget;
                setActiveIndex(index);
              }}
            >
              <Image
                className="studio-study-photo"
                src={image}
                alt={alt}
                sizes={studioPhotoSizes}
              />
              <span className="studio-study-flip-cue font-pencil" aria-hidden="true">Flip for a note ↷</span>
            </button>
            <figcaption className="studio-study-caption"><span>STUDY / 0{index + 1}</span><span className="font-pencil">{caption}</span></figcaption>
          </figure>
        ))}
        <p className="art-wall-note font-pencil" aria-hidden="true">there is no wrong colour ↗</p>
      </div>
      <div className="art-wall-bottom"><p>Not a masterpiece. A starting point.<br />Your hands will take it somewhere else.</p><Link href="#story-reel">A glimpse inside our studio <span aria-hidden="true">↗</span></Link></div>
      <dialog
        ref={dialogRef}
        className="studio-postcard-dialog"
        aria-labelledby="studio-postcard-title"
        aria-describedby="studio-postcard-note"
        data-lenis-prevent
        onClick={event => {
          if (event.target === event.currentTarget) returnPhoto();
        }}
        onCancel={event => {
          event.preventDefault();
          returnPhoto();
        }}
        onClose={event => {
          event.currentTarget.removeAttribute("data-closing");
          setActiveIndex(null);
          openerRef.current?.focus({ preventScroll: true });
        }}
      >
        {activePhoto && (
          <>
            <div className="studio-postcard-sheet" ref={sheetRef}>
              <div className="studio-postcard-flip" ref={flipRef}>
                <figure className="studio-postcard-front" aria-hidden="true" data-study={activeIndex}>
                  <Image className="studio-study-photo" src={activePhoto.image} alt="" sizes={studioPhotoSizes} loading="eager" />
                  <figcaption className="studio-study-caption">
                    <span>STUDY / 0{(activeIndex ?? 0) + 1}</span>
                    <span className="font-pencil">{activePhoto.caption}</span>
                  </figcaption>
                </figure>
                <div className="studio-postcard-back">
                  <div className="studio-postcard-mark"><span>SNAPART FIELD NOTES</span><span>0{(activeIndex ?? 0) + 1} / 03</span></div>
                  <div>
                    <h3 id="studio-postcard-title" className="font-pencil">{activePhoto.noteTitle}</h3>
                    <div id="studio-postcard-note">
                      <p className="font-pencil">{activePhoto.note}</p>
                      <div className="studio-postcard-next">
                        <span>Try next time</span>
                        <p className="font-pencil">{activePhoto.nextStep}</p>
                      </div>
                    </div>
                  </div>
                  <span className="studio-postcard-signature font-pencil">for the next time we make ♡</span>
                </div>
              </div>
            </div>
            <button className="studio-postcard-close" type="button" onClick={returnPhoto}>
              <span aria-hidden="true">←</span> Back to the wall
            </button>
          </>
        )}
      </dialog>
    </section>
  );
}

function getPrintPose(frame: HTMLElement) {
  const rect = frame.getBoundingClientRect();
  const transform = getComputedStyle(frame).transform;
  const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
  return {
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    width: frame.offsetWidth * Math.hypot(matrix.a, matrix.b),
    height: frame.offsetHeight * Math.hypot(matrix.c, matrix.d),
    angle: Math.atan2(matrix.b, matrix.a),
  };
}

function photoFrameTransform(source: ReturnType<typeof getPrintPose>, dialog: HTMLDialogElement, sheet: HTMLDivElement) {
  // The dialog remains fixed while its sheet animates, so this works in either direction.
  const destination = dialog.getBoundingClientRect();
  const x = source.centerX - destination.left - sheet.offsetWidth / 2;
  const y = source.centerY - destination.top - sheet.offsetHeight / 2;
  const scaleX = source.width / sheet.offsetWidth;
  const scaleY = source.height / sheet.offsetHeight;
  return `translate(${x}px, ${y}px) rotate(${source.angle}rad) scale(${scaleX}, ${scaleY})`;
}
