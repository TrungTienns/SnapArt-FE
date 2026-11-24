"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => null;

export function Footer() {
  const year = useSyncExternalStore(subscribe, getYear, getServerYear);
  return (
    <footer className="site-footer" aria-label="SnapArt footer">
      <div className="site-footer-top">
        <p className="site-footer-note font-pencil">Leave a little colour behind.</p>
        <Link className="site-footer-book" href="/booking">
          Come paint with us <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="site-footer-imprint" aria-hidden="true"><span>paint a little.</span><span className="font-pencil">stay a while.</span></div>
      <nav className="site-footer-nav" aria-label="Footer navigation">
        <Link href="/workshops">Workshops</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/about">Our studio</Link>
      </nav>
      <Link href="/" className="site-footer-wordmark" aria-label="SnapArt home">Snap<span className="site-footer-art font-pencil">Art</span></Link>
      <div className="site-footer-bottom">
        <span>SnapArt Studio · Saigon</span>
        <p className="font-pencil">In love with paint.</p>
        <span>© {year} SnapArt</span>
      </div>
    </footer>
  );
}
