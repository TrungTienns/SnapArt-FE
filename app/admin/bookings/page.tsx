import type { Metadata } from "next";
import { BookingAdmin } from "./BookingAdmin";

export const metadata: Metadata = {
  title: "Workshop bookings | SnapArt Admin",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface-canvas)] px-5 py-12 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Workshop bookings</h1>
        <BookingAdmin />
      </div>
    </main>
  );
}
