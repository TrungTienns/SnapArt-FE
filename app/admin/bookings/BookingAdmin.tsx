"use client";

import { useEffect, useState, type FormEvent } from "react";
import { snapArtApi, SnapArtApiError } from "@/lib/snapart-api";

type Status = "pending" | "contacted" | "confirmed" | "cancelled";

interface Booking {
  id: string;
  code: string;
  workshop: string;
  contactName: string;
  contactPhone: string;
  preferredDate: string;
  seatCount: number;
  notes: string | null;
  status: Status;
  confirmedStartAt: string | null;
}

interface BookingPage {
  bookings: Booking[];
  nextCursor: string | null;
}

const inputClass = "min-h-11 rounded-sm border border-current bg-white px-3 py-2 text-base";
const actionClass = "inline-flex min-h-11 items-center rounded-full border border-current px-4 py-1 text-sm font-semibold hover:bg-[var(--color-surface-raised)] disabled:opacity-50";
const studioTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

function bookingsPath(code: string | null, before?: string) {
  const query = new URLSearchParams();
  if (code) query.set("code", code);
  if (before) query.set("before", before);
  return `/admin/bookings?${query}`;
}

export function BookingAdmin() {
  const [code, setCode] = useState<string | null>(null);
  const [mode, setMode] = useState<"loading" | "login" | "ready" | "unavailable">("loading");
  const [page, setPage] = useState<BookingPage>({ bookings: [], nextCursor: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleError(cause: unknown) {
    if (cause instanceof SnapArtApiError && cause.status === 401) {
      setPage({ bookings: [], nextCursor: null });
      setMode("login");
    }
    setError(cause instanceof SnapArtApiError ? cause.message : "Could not connect. Please try again.");
  }

  async function loadBookings(selectedCode: string | null, before?: string) {
    const next = await snapArtApi<BookingPage>(bookingsPath(selectedCode, before));
    setPage((current) => ({
      bookings: before ? [...current.bookings, ...next.bookings] : next.bookings,
      nextCursor: next.nextCursor,
    }));
    setMode("ready");
  }

  useEffect(() => {
    const selectedCode = new URLSearchParams(window.location.search).get("code");
    let active = true;
    snapArtApi<BookingPage>(bookingsPath(selectedCode)).then((result) => {
      if (!active) return;
      setCode(selectedCode);
      setPage(result);
      setMode("ready");
    }).catch((cause) => {
      if (!active) return;
      setCode(selectedCode);
      if (cause instanceof SnapArtApiError && cause.status === 401) setMode("login");
      else setMode("unavailable");
    });
    return () => { active = false; };
  }, []);

  async function perform(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    void perform(async () => {
      await snapArtApi("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      form.reset();
      await loadBookings(code);
    });
  }

  function updateStatus(booking: Booking, status: Status, localStart?: string) {
    void perform(async () => {
      const confirmedStartAt = localStart ? new Date(`${localStart}:00+07:00`) : null;
      if (confirmedStartAt && !Number.isFinite(confirmedStartAt.getTime())) {
        setError("Enter a valid start time.");
        return;
      }
      await snapArtApi(`/admin/bookings/${booking.code}`, {
        method: "PATCH",
        body: JSON.stringify({ status, confirmedStartAt: confirmedStartAt?.toISOString() }),
      });
      await loadBookings(code);
    });
  }

  return (
    <div className="text-base">
      {error && <p className="mb-4 font-semibold" role="alert">{error}</p>}
      {mode === "loading" && <p role="status">Loading bookings…</p>}
      {mode === "unavailable" && (
        <button className={actionClass} disabled={busy} onClick={() => void perform(() => loadBookings(code))}>
          Retry connection
        </button>
      )}
      {mode === "login" && (
        <form method="post" className="grid max-w-sm gap-4" onSubmit={login}>
          <label className="grid gap-1">
            Admin email
            <input className={inputClass} name="email" type="email" autoComplete="username" maxLength={254} required />
          </label>
          <label className="grid gap-1">
            Password
            <input className={inputClass} name="password" type="password" autoComplete="current-password" maxLength={256} required />
          </label>
          <button className={actionClass} type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
      )}
      {mode === "ready" && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            {code && <a className={actionClass} href="/admin/bookings">All bookings</a>}
            <button className={actionClass} disabled={busy} onClick={() => void perform(async () => {
              await snapArtApi("/admin/logout", { method: "POST", body: "{}" });
              setPage({ bookings: [], nextCursor: null });
              setMode("login");
            })}>Sign out</button>
          </div>
          {page.bookings.length === 0 && <p>No booking requests found.</p>}
          <ul className="grid gap-4">
            {page.bookings.map((booking) => (
              <li key={booking.id} className="min-w-0 border border-[var(--color-border-canvas)] bg-white p-4 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-bold">{booking.workshop}</h2>
                  <p className="capitalize">{booking.status}</p>
                </div>
                <p className="my-2 break-all text-sm">Reference {booking.code}</p>
                <p>{booking.preferredDate} preferred · {booking.seatCount} guests</p>
                <p>{booking.contactName} · <a className="underline" href={`tel:${booking.contactPhone}`}>{booking.contactPhone}</a></p>
                {booking.notes && <p className="my-2 wrap-break-word whitespace-pre-wrap">{booking.notes}</p>}
                {booking.confirmedStartAt && <p>Agreed start {studioTime.format(new Date(booking.confirmedStartAt))} (Vietnam time)</p>}
                {booking.status !== "cancelled" && (
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    {booking.status === "pending" && <button className={actionClass} disabled={busy} onClick={() => updateStatus(booking, "contacted")}>Mark contacted</button>}
                    {booking.status !== "confirmed" && (
                      <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        updateStatus(booking, "confirmed", String(data.get("start")));
                      }}>
                        <label className="grid gap-1 text-sm">
                          Start time in Vietnam
                          <input className={inputClass} name="start" type="datetime-local" required />
                        </label>
                        <button className={actionClass} disabled={busy} type="submit">Confirm booking</button>
                      </form>
                    )}
                    <button className={actionClass} disabled={busy} onClick={() => {
                      if (window.confirm("Cancel this booking request?")) updateStatus(booking, "cancelled");
                    }}>Cancel booking</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {page.nextCursor && <button className={`mt-5 ${actionClass}`} disabled={busy} onClick={() => {
            if (page.nextCursor) void perform(() => loadBookings(code, page.nextCursor!));
          }}>Load more bookings</button>}
        </>
      )}
    </div>
  );
}
