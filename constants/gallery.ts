import type { StaticImageData } from "next/image";
import sharedTable from "@/public/assets/images/gallery/shared-table.jpg";
import firstMark from "@/public/assets/images/gallery/first-mark.jpg";
import colourNotes from "@/public/assets/images/gallery/colour-notes.jpg";
import mixingColour from "@/public/assets/images/gallery/mixing-colour.jpg";
import workInProgress from "@/public/assets/images/gallery/work-in-progress.jpg";
import brushesReady from "@/public/assets/images/gallery/brushes-ready.jpg";
import paintedPottery from "@/public/assets/images/gallery/painted-pottery.jpg";
import watercolourStudy from "@/public/assets/images/gallery/watercolour-study.jpg";

export interface GalleryPhoto {
  id: string;
  image: StaticImageData | string;
  title: string;
  alt: string;
  credit?: { name: string; url: string };
}

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: "shared-table",
    image: sharedTable,
    title: "Around the table",
    alt: "An overhead view of a shared art table with paint, brushes, and works in progress",
    credit: { name: "Anna Tarazevich", url: "https://www.pexels.com/photo/6146655/" },
  },
  {
    id: "first-mark",
    image: firstMark,
    title: "The first mark",
    alt: "A hand painting abstract shapes on a canvas",
    credit: { name: "Emanuel Pedro", url: "https://www.pexels.com/photo/32323455/" },
  },
  {
    id: "colour-notes",
    image: colourNotes,
    title: "Notes in colour",
    alt: "A brush and a colourful set of watercolours seen from above",
    credit: { name: "Maria Isabelle Warren", url: "https://www.pexels.com/photo/9139319/" },
  },
  {
    id: "mixing-colour",
    image: mixingColour,
    title: "A colour of your own",
    alt: "Hands mixing paint on a palette",
    credit: { name: "cottonbro studio", url: "https://www.pexels.com/photo/7885462/" },
  },
  {
    id: "work-in-progress",
    image: workInProgress,
    title: "Still becoming",
    alt: "An artist at work at a table scattered with paint",
    credit: { name: "RDNE Stock project", url: "https://www.pexels.com/photo/10474209/" },
  },
  {
    id: "brushes-ready",
    image: brushesReady,
    title: "Brushes at the ready",
    alt: "Hands arranging paintbrushes and supplies before an art workshop",
    credit: { name: "Ricardo E. Díaz Vega", url: "https://www.pexels.com/photo/37442202/" },
  },
  {
    id: "painted-pottery",
    image: paintedPottery,
    title: "Paint on clay",
    alt: "Workshop participants painting pottery by hand",
    credit: { name: "Asad Photo Maldives", url: "https://www.pexels.com/photo/30225356/" },
  },
  {
    id: "watercolour-study",
    image: watercolourStudy,
    title: "Little washes of colour",
    alt: "Paint swatches and a watercolour palette on a wooden surface",
    credit: { name: "Pavel Danilyuk", url: "https://www.pexels.com/photo/6925017/" },
  },
];
