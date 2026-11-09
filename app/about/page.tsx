import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { en } from "@/locales";

export default function AboutPage() {
  return <><Header /><main className="min-h-screen bg-[var(--color-surface-canvas)] px-6 pb-20 pt-40 text-[var(--color-text-primary)] md:px-16"><p className="art-kicker">SNAPART / ABOUT US</p><h1 className="my-12 text-[clamp(4rem,12vw,12rem)] font-black leading-[.85] tracking-[-.07em]">IN LOVE<br />WITH <span className="font-pencil font-normal text-[var(--color-wordmark-r)]">paint.</span></h1><p className="max-w-2xl text-xl leading-relaxed">{en.aboutUs.intro}</p><p className="my-8 max-w-2xl text-lg leading-relaxed">{en.aboutUs.body}</p><Link href="/" className="studio-closing-link">BACK TO SNAPART ↗</Link></main></>;
}
