import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { BookingRequestForm } from "@/components/workshops/BookingRequestForm";
import "./workshops.css";

export const metadata: Metadata = {
  title: "Book a Painting Workshop | SnapArt",
  description: "Choose a painting workshop and tell SnapArt when you’d like to visit the studio in Saigon.",
};

export default function BookingPage() {
  return (
    <>
      <Header />
      <main className="workshop-page">
        <div className="workshop-shell">
          <header className="workshop-masthead">
            <h1>Book a <span className="font-pencil">workshop.</span></h1>
            <div className="workshop-masthead-note">
              <p className="workshop-location">SnapArt Studio <span aria-hidden="true">·</span> Saigon</p>
              <p>Pick something to paint. Tell us when you’d like to come. We’ll call to find a time together.</p>
            </div>
          </header>
          <BookingRequestForm />
        </div>
      </main>
    </>
  );
}
