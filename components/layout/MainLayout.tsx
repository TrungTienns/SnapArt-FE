import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChristmasSnowfall } from "@/components/common/ChristmasSnowfall";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className = "relative flex-1 w-full" }: MainLayoutProps) {
  return (
    <>
      <ChristmasSnowfall />
      <Header />
      <main className={className}>{children}</main>
      <Footer />
    </>
  );
}
