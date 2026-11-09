import type { Metadata } from "next";
import { Shadows_Into_Light } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/common/SmoothScrollProvider";
import { CustomPaintbrushCursor } from "@/components/common/CustomPaintbrushCursor";

// Light handwritten wordmark font
const shadowsIntoLight = Shadows_Into_Light({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-child-pencil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SnapArt - A Creative Haven Where Ideas Awaken",
  description: "Painting workshops, bespoke art commissions, exhibitions and inspiring experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${shadowsIntoLight.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#fbfbf9] text-[#411f15] selection:bg-[#f2b8cb] selection:text-[#411f15]">
        {/* Custom 3D Paintbrush Cursor */}
        <CustomPaintbrushCursor />
        {/* Smooth Scroll */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
