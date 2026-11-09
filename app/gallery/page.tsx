import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { galleryPhotos } from "@/constants/gallery";

export const metadata: Metadata = {
  title: "Gallery | SnapArt",
  description: "A photo journal of paint, paper, and workshop moments.",
};

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main className="snap-gallery-archive">
        <header className="snap-gallery-archive-heading">
          <Link href="/#gallery" className="snap-gallery-back">← Back to the album</Link>
          <p className="art-kicker">SnapArt / Photo archive</p>
          <h1>Gallery <span className="font-pencil">the full album.</span></h1>
          <p className="snap-gallery-archive-intro">A place for the photos and pieces made around the workshop table.</p>
        </header>
        <div className="snap-gallery-archive-label">
          <span>{galleryPhotos.length} photographs</span>
          <span>Illustrative photos from Pexels</span>
        </div>
        <ul className="snap-gallery-archive-grid">
          {galleryPhotos.map((photo) => (
            <li key={photo.id}>
              <figure className="snap-gallery-archive-print">
                <div className="snap-gallery-archive-image">
                  <Image
                    src={photo.image}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 88vw, (max-width: 960px) 44vw, 30vw"
                    placeholder={typeof photo.image === "string" ? "empty" : "blur"}
                  />
                </div>
                <figcaption>
                  <p className="font-pencil">{photo.title}</p>
                  {photo.credit && <a href={photo.credit.url}>{photo.credit.name} / Pexels</a>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
