import type { en } from "./en";

type Header = typeof en.header;

// Add Vietnamese values here when ready. Missing keys use the English copy.
export const vi: {
  header: Partial<Record<Exclude<keyof Header, "nav" | "menu">, string>> & {
    nav?: Partial<Record<keyof Header["nav"], string>>;
    menu?: Partial<Record<keyof Header["menu"], string>>;
  };
  drawing?: Partial<Record<keyof typeof en.drawing, string>>;
} = {
  header: {},
  drawing: {
    start: "Chạm để vẽ",
    finish: "Xong · cuộn tiếp",
  },
};
