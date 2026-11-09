export const en = {
  header: {
    brand: "SNAPART",
    lang: "ENG | VIE",
    social: "INST: @SNAPART.STUDIO",
    nav: {
      workshops: "WORKSHOPS",
      customArt: "CUSTOM ART",
      gallery: "GALLERY",
      aboutUs: "ABOUT US",
      booking: "BOOK A SEAT",
    },
  },
  hero: {
    badgeAbout: "ABOUT US",
    badgeCustomArt: "CUSTOM ART",
    badgeWorkshops: "WORKSHOPS",
    titlePrefix: "A",
    titleBrand: "SnapArt",
    titleSuffix: "HAVEN",
    titleLine2: "WHERE IDEAS AWAKEN",
    subtitle:
      "PAINTING WORKSHOPS, BESPOKE ART COMMISSIONS, EXHIBITIONS AND INSPIRING EXPERIENCES.",
  },
  aboutUs: {
    land: "SnapArt land",
    title: "about us",
    script: "in love with paint",
    intro: "An open studio in Saigon making painting workshops, commissions, and exhibitions.",
    scrollMark: "↓",
    caption: [
      "SnapArt is a community studio for painters, beginners,",
      "and anyone who wants to leave with a story they made.",
      "We host workshops, commissions, and exhibitions",
      "to keep making joyful, messy, and close at hand.",
    ],
    manifesto: [
      "A beginner-friendly studio",
      "in Saigon that brings together",
      "people who want to make.",
    ],
    kickerStudio: "Our studio",
    body: "We're passionate about painting in all its forms, and we love sitting around a splattered table with first-timers, friends, and anyone ready to turn “I can't draw” into “look what I made.”",
    cta: "About us",
  },
  features: {
    tagWorkshops: "ART EXPERIENCES",
    titleWorkshops: "Painting Workshops",
    descWorkshops:
      "From acrylic & watercolor to classic oil painting. Beginner-friendly guided sessions with professional artists.",
    btnWorkshops: "EXPLORE SESSIONS",

    tagCustomArt: "BESPOKE SERVICE",
    titleCustomArt: "Art on Demand",
    descCustomArt:
      "Commission custom portraits, landscape canvases, and personalized creative artworks made to order.",
    btnCustomArt: "ORDER CUSTOM PIECE",
  },
  cookie: {
    text: "WE USE COOKIES TO ENHANCE YOUR CREATIVE BROWSING EXPERIENCE.",
    readMore: "READ MORE",
    accept: "ACCEPT",
  },
  footer: {
    tagline: "SnapArt Studio - The art of expressing emotions through brushstrokes.",
    rights: "ALL RIGHTS RESERVED.",
  },
} as const;

export type TranslationType = typeof en;
