"use client";

import { useRef, useState } from "react";

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayLabel = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" });
const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function parseWorkshopDate(value: string): string | undefined {
  const trimmed = value.trim();
  const display = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  const iso = display ? `${display[3]}-${display[2].padStart(2, "0")}-${display[1].padStart(2, "0")}` : trimmed;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso < "1000-01-01") return;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso) return iso;
}

export function WorkshopDateField({
  value, today, error, onChange,
}: {
  value: string;
  today: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [month, setMonth] = useState(today.slice(0, 7));
  const selected = parseWorkshopDate(value);
  const first = new Date(`${month}-01T00:00:00Z`);
  const year = first.getUTCFullYear();
  const index = first.getUTCMonth();
  const days = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;

  function moveMonth(delta: number) {
    setMonth(new Date(Date.UTC(year, index + delta, 1)).toISOString().slice(0, 7));
  }

  return (
    <div className="workshop-date">
      <label htmlFor="workshop-date-input">Preferred date</label>
      <div className="workshop-date-control">
        <input id="workshop-date-input" name="preferredDate" type="text" placeholder="DD/MM/YYYY"
          maxLength={10} autoComplete="off" required value={value}
          aria-invalid={Boolean(error)} aria-describedby={error ? "workshop-date-error" : undefined}
          onChange={(event) => onChange(event.target.value)} />
        <button type="button" aria-label="Open calendar" aria-haspopup="dialog" onClick={() => {
          setMonth((selected && selected >= today ? selected : today).slice(0, 7));
          dialog.current?.showModal();
        }}><span className="workshop-calendar-icon" aria-hidden="true" /></button>
      </div>
      {error && <p className="workshop-field-error" id="workshop-date-error">{error}</p>}

      <dialog className="workshop-calendar" data-lenis-prevent ref={dialog} aria-labelledby="workshop-calendar-title">
        <header>
          <h3 id="workshop-calendar-title">Pick a <em className="font-pencil">date</em></h3>
          <button type="button" className="workshop-calendar-close" aria-label="Close calendar"
            onClick={() => dialog.current?.close()}>×</button>
        </header>
        <div className="workshop-calendar-navigation">
          <button type="button" aria-label="Previous month" disabled={month <= today.slice(0, 7)}
            onClick={() => moveMonth(-1)}>‹</button>
          <p aria-live="polite">{monthLabel.format(first)}</p>
          <button type="button" aria-label="Next month" disabled={month >= "9999-12"}
            onClick={() => moveMonth(1)}>›</button>
        </div>
        <div className="workshop-calendar-grid">
          {weekdays.map((day) => <span key={day} className="workshop-calendar-weekday" aria-hidden="true">{day}</span>)}
          {Array.from({ length: days }, (_, day) => {
            const date = `${month}-${String(day + 1).padStart(2, "0")}`;
            return (
              <button key={date} type="button" disabled={date < today}
                style={day === 0 ? { gridColumnStart: offset + 1 } : undefined}
                aria-pressed={date === selected} aria-current={date === today ? "date" : undefined}
                aria-label={dayLabel.format(new Date(`${date}T00:00:00Z`))}
                onClick={() => {
                  const [year, month, day] = date.split("-");
                  onChange(`${day}/${month}/${year}`);
                  dialog.current?.close();
                }}>{day + 1}</button>
            );
          })}
        </div>
      </dialog>
    </div>
  );
}
