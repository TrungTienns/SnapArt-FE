import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { galleryPhotos } from "@/constants/gallery";
import "./workshop-studio.css";

export const metadata: Metadata = {
  title: "Painting Workshops | SnapArt",
  description: "Explore acrylic painting, watercolour and pottery painting at the SnapArt studio in Saigon.",
};

const mediums = [
  { photoId: "first-mark", title: "Acrylic on canvas", description: "Layer bold colour.", sizes: "(max-width: 700px) 90vw, 48vw" },
  { photoId: "colour-notes", title: "Watercolour on paper", description: "Mix soft washes.", sizes: "(max-width: 700px) 90vw, 36vw" },
  { photoId: "painted-pottery", title: "Paint on pottery", description: "Make a piece your own.", sizes: "(max-width: 700px) 78vw, 28vw" },
].map((medium) => ({
  ...medium,
  photo: galleryPhotos.find(({ id }) => id === medium.photoId),
}));

export default function WorkshopsPage() {
  return (
    <>
      <Header />
      <main className="workshop-studio">
        <section className="workshop-studio-hero" aria-labelledby="workshop-studio-title">
          <Image
            className="workshop-studio-cover"
            src="/assets/images/workshop-studio-cover.webp"
            alt="Hands painting together at a table with brushes, ceramics and colourful paint"
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <div className="workshop-studio-intro">
            <p className="art-kicker">SnapArt Studio · Saigon</p>
            <h1 id="workshop-studio-title">Workshops</h1>
            <p className="workshop-studio-handwriting font-pencil">Paint together.</p>
            <a className="workshop-studio-explore" href="#workshop-mediums">
              Explore workshops <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section className="workshop-studio-mediums" id="workshop-mediums" aria-labelledby="workshop-mediums-title">
          <h2 id="workshop-mediums-title">Pick a <em className="font-pencil">medium.</em></h2>
          <ul className="workshop-studio-prints">
            {mediums.map(({ photoId, photo, title, description, sizes }) => (
              <li key={photoId} className="workshop-studio-print" data-medium={photoId}>
                {photo && (
                  <div className="workshop-studio-sample">
                    <Image src={photo.image} alt={photo.alt} fill sizes={sizes} />
                  </div>
                )}
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ul>
          <details className="workshop-studio-credits">
            <summary>Photo credits</summary>
            <ul>
              {mediums.map(({ photoId, photo }) => photo?.credit && (
                <li key={photoId}><a href={photo.credit.url}>{photo.credit.name} / Pexels</a></li>
              ))}
            </ul>
          </details>
        </section>

        <section className="workshop-studio-reserve" aria-labelledby="workshop-reserve-title">
          <div className="workshop-studio-ticket">
            <div className="workshop-studio-ticket-copy">
              <h2 id="workshop-reserve-title">Save a <em className="font-pencil">seat.</em></h2>
              <p>Pick a date. We’ll call to confirm.</p>
            </div>
            <div className="workshop-studio-palette" aria-hidden="true">
              <Image
                src="/assets/images/workshop-ceramic-palette.webp"
                alt=""
                fill
                sizes="(max-width: 700px) 28vw, (max-width: 1100px) 18vw, 212px"
              />
            </div>
            <Link href="/booking">Book now <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
