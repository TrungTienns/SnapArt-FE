"use client";

import { useSyncExternalStore } from "react";
import { en } from "./en";
import { vi } from "./vi";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

const getLanguage = () => document.documentElement.lang.split("-")[0].toLowerCase();
const getServerLanguage = () => "en";

export function useHeaderMessages() {
  const language = useSyncExternalStore(subscribe, getLanguage, getServerLanguage);
  const translated = language === "vi" ? vi.header : {};
  return {
    ...en.header,
    ...translated,
    nav: { ...en.header.nav, ...translated.nav },
    menu: { ...en.header.menu, ...translated.menu },
  };
}

export function useDrawingMessages() {
  const language = useSyncExternalStore(subscribe, getLanguage, getServerLanguage);
  return language === "vi" ? { ...en.drawing, ...vi.drawing } : en.drawing;
}
