"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { WorkshopDateField, parseWorkshopDate } from "./WorkshopDateField";
import { galleryPhotos } from "@/constants/gallery";
import { snapArtApi, SnapArtApiError } from "@/lib/snapart-api";
import type { BookingRequestInput } from "@/types/booking";

interface WorkshopOption {
  id: string;
  title: string;
  description: string;
}

type Catalogue =
  | { status: "loading" | "error" }
  | { status: "ready"; workshops: WorkshopOption[] };

const previewWorkshops: WorkshopOption[] = [
  { id: "acrylic", title: "Acrylic on canvas", description: "Layer bold colour, one brushstroke at a time." },
  { id: "watercolor", title: "Watercolour on paper", description: "Let pigment and water find their own edges." },
  { id: "pottery", title: "Paint on pottery", description: "Turn an everyday piece into something of your own." },
];

const artworkIds: Record<string, string> = {
  acrylic: "first-mark",
  watercolor: "colour-notes",
  pottery: "painted-pottery",
};

const steps = ["Workshop", "Your visit", "Review"];

const maxGroupSize = 4_294_967_295;
const emptyDetails = { preferredDate: "", seatCount: "1", contactName: "", contactPhone: "", notes: "" };

type FieldErrors = Partial<Record<keyof typeof emptyDetails, string>>;

const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" });
const studioCalendar = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function BookingRequestForm() {
  const [catalogue, setCatalogue] = useState<Catalogue>({ status: "loading" });
  const [catalogueAttempt, setCatalogueAttempt] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [step, setStep] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState(emptyDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ code?: string } | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const pending = useRef(false);
  const previous = useRef<{ body: string; key: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const turn = useRef<Animation | null>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview") === "1";
    const request = preview ? Promise.resolve(previewWorkshops) : snapArtApi<WorkshopOption[]>("/workshops");
    let active = true;
    request.then((workshops) => {
      if (active) {
        setIsPreview(preview);
        setCatalogue({ status: "ready", workshops });
      }
    }).catch(() => {
      if (active) setCatalogue({ status: "error" });
    });
    return () => { active = false; };
  }, [catalogueAttempt]);

  useEffect(() => {
    if (isTurning || !moveFocus.current) return;
    moveFocus.current = false;
    const target = heading.current;
    target?.focus({ preventScroll: true });
    if (target && (target.getBoundingClientRect().top < 104 || target.getBoundingClientRect().top > window.innerHeight - 80)) {
      target.scrollIntoView({ block: "start" });
    }
  }, [step, receipt, isTurning]);

  useEffect(() => () => {
    turn.current?.cancel();
    turn.current = null;
  }, []);

  const workshops = catalogue.status === "ready" ? catalogue.workshops : [];
  const selected = workshops.find(({ id }) => id === selectedId) ?? workshops[0];
  const photo = galleryPhotos.find(({ id }) => id === artworkIds[selected?.id ?? ""]) ?? galleryPhotos[0];

  const groupSize = Number(details.seatCount);
  const preferredDate = parseWorkshopDate(details.preferredDate);

  async function goTo(next: number) {
    if (next === step || pending.current || turn.current) return;
    setError("");
    moveFocus.current = true;

    const sheet = page.current;
    const stage = sheet?.parentElement;
    if (!stage || !sheet.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(next);
      return;
    }

    // Keep the outgoing page as a visual layer while React renders the next step beneath it.
    const leaf = sheet.cloneNode(true) as HTMLDivElement;
    leaf.inert = true;
    leaf.setAttribute("aria-hidden", "true");
    leaf.classList.add("workshop-paper-copy");
    leaf.querySelectorAll("[id], [name]").forEach((element) => {
      element.removeAttribute("id");
      element.removeAttribute("name");
    });
    leaf.style.height = `${sheet.offsetHeight}px`;
    stage.style.minHeight = leaf.style.height;
    stage.append(leaf);

    const forward = next > step;
    const point = (x: number, y: number) => `${forward ? x : 100 - x}% ${forward ? y : 100 - y}%`;
    const paperEdge = (diagonal: number) => (
      `polygon(${point(-100, -100)}, ${point(diagonal + 100, -100)}, ${point(-100, diagonal + 100)})`
    );
    const crease = document.createElement("span");
    crease.className = "workshop-paper-crease";
    if (!forward) crease.style.transform = "rotate(180deg)";
    leaf.append(crease);

    const timing: KeyframeAnimationOptions = {
      duration: 650,
      easing: "cubic-bezier(.38, .08, .26, 1)",
      fill: "forwards",
    };
    const animation = leaf.animate([
      { clipPath: paperEdge(200) },
      { clipPath: paperEdge(0) },
    ], timing);
    const lighting = crease.animate([
      { backgroundPosition: "0% 50%" },
      { backgroundPosition: "100% 50%" },
    ], timing);
    turn.current = animation;
    setIsTurning(true);
    setStep(next);

    await animation.finished.catch(() => {});
    lighting.cancel();
    leaf.remove();
    stage.style.removeProperty("min-height");
    if (turn.current !== animation) return;
    turn.current = null;
    setIsTurning(false);
  }

  function updateDetail(key: keyof typeof emptyDetails, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || pending.current || turn.current) return;
    if (step === 0) {
      await goTo(1);
      return;
    }
    const today = studioCalendar.format(new Date());
    const dateError = !preferredDate
      ? "Enter a valid date in DD/MM/YYYY format."
      : preferredDate < today ? "Choose today or a later date." : undefined;

    if (step === 1) {
      const errors: FieldErrors = {};
      if (dateError) errors.preferredDate = dateError;
      if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > maxGroupSize) {
        errors.seatCount = "Enter a valid group size of at least one guest.";
      }
      if (!details.contactName.trim()) errors.contactName = "Enter your name.";
      if (!/^\+?(?:[ ()-]*[0-9]){8,15}[ ()-]*$/.test(details.contactPhone.trim())) {
        errors.contactPhone = "Enter a phone number with 8 to 15 digits.";
      }
      setFieldErrors(errors);
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const field = event.currentTarget.elements.namedItem(firstError);
        if (field instanceof HTMLElement) field.focus();
        return;
      }
      await goTo(2);
      return;
    }

    if (!preferredDate || dateError) {
      setError("Your preferred date is no longer available. Go back to choose another date.");
      return;
    }

    if (isPreview) {
      moveFocus.current = true;
      setReceipt({});
      return;
    }

    const request: BookingRequestInput = {
      workshopId: selected.id,
      preferredDate,
      seatCount: Number(details.seatCount),
      contactName: details.contactName.trim(),
      contactPhone: details.contactPhone.trim(),
      notes: details.notes.trim() || undefined,
    };
    pending.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      const body = JSON.stringify(request);
      const key = previous.current?.body === body ? previous.current.key : crypto.randomUUID();
      previous.current = { body, key };
      const { code } = await snapArtApi<{ code: string }>("/booking-requests", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body,
      });
      previous.current = null;
      moveFocus.current = true;
      setReceipt({ code });
    } catch (cause) {
      setError(cause instanceof SnapArtApiError
        ? cause.message
        : "We couldn’t verify your request. Try again with the same details.");
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  }

  function restart() {
    moveFocus.current = true;
    setReceipt(null);
    setStep(0);
    setSelectedId("");
    setDetails(emptyDetails);
    setFieldErrors({});
    setError("");
  }

  return (
    <section className="workshop-spread" data-step={receipt ? "complete" : step} aria-label="Workshop booking">
      <div className="workshop-art">
        <figure className="workshop-print">
          <div className="workshop-photo" key={photo.id}>
            <Image src={photo.image} alt={photo.alt} fill sizes="(max-width: 760px) 92vw, (max-width: 1400px) 42vw, 550px" />
          </div>
          <figcaption>
            {selected && <span className="font-pencil">{selected.title}</span>}
            {photo.credit && <a href={photo.credit.url}>{photo.credit.name} / Pexels</a>}
          </figcaption>
        </figure>
      </div>

      <div className="workshop-paper-stage" aria-busy={isTurning}>
        <div className="workshop-paper" data-step={receipt ? "complete" : step} ref={page} inert={isTurning}>
          {isPreview && <p className="workshop-preview">Preview mode · Nothing is sent to the studio.</p>}
          {receipt ? (
            <div className="workshop-receipt">
              <span className="workshop-receipt-mark" aria-hidden="true">✓</span>
              <h2 tabIndex={-1} ref={heading}>{receipt.code ? "Request received." : "Preview complete."}</h2>
              {receipt.code ? (
                <>
                  <p>Keep this reference. We’ll call to confirm the date and time of your workshop.</p>
                  <p className="workshop-reference"><span>Booking reference</span><strong>{receipt.code}</strong></p>
                </>
              ) : <p>You’ve reached the end of the booking preview.</p>}
              <button className="workshop-primary" type="button" onClick={restart}>Book another workshop <span aria-hidden="true">↗</span></button>
            </div>
          ) : (
            <>
              <ol className="workshop-steps" aria-label="Booking progress">
                {steps.map((label, index) => (
                  <li key={label} aria-current={step === index ? "step" : undefined}>
                    {index < step ? (
                      <button type="button" disabled={isSubmitting} onClick={() => goTo(index)}>
                        <span aria-hidden="true">✓ </span>{label}
                      </button>
                    ) : <span>{label}</span>}
                  </li>
                ))}
              </ol>
              <h2 className="workshop-step-heading" ref={heading} tabIndex={-1}>
                {step === 1
                  ? <>Plan your <em className="font-pencil">visit</em></>
                  : step === 0 ? <>Choose your <em className="font-pencil">workshop</em></> : "Review your request"}
              </h2>

              <form className="workshop-form" method="post" noValidate onSubmit={submitRequest} aria-busy={isSubmitting}>
                {step === 0 && (
                  <fieldset className="workshop-notebook workshop-choices">
                    <legend className="sr-only">Choose your workshop</legend>
                    {catalogue.status === "loading" && <p className="workshop-message" role="status">Loading workshops…</p>}
                    {catalogue.status === "error" && (
                      <div className="workshop-message">
                        <p role="alert">We couldn’t load the workshops.</p>
                        <button className="workshop-back" type="button" onClick={() => {
                          setCatalogue({ status: "loading" });
                          setCatalogueAttempt((attempt) => attempt + 1);
                        }}>Try again</button>
                      </div>
                    )}
                    {catalogue.status === "ready" && workshops.length === 0 && <p className="workshop-message">No workshops are taking requests right now.</p>}
                    {workshops.map((option) => {
                      const sample = galleryPhotos.find(({ id }) => id === artworkIds[option.id]);
                      return (
                        <label className="workshop-choice" key={option.id}>
                          <input className="sr-only" type="radio" name="workshopId" value={option.id}
                            checked={option.id === selected?.id} onChange={() => setSelectedId(option.id)} required />
                          {sample && <span className="workshop-choice-image"><Image src={sample.image} alt="" fill sizes="68px" /></span>}
                          <span className="workshop-choice-copy">
                            <strong>{option.title}</strong>
                            <span>{option.description}</span>
                          </span>
                          <span className="workshop-choice-radio" aria-hidden="true" />
                        </label>
                      );
                    })}
                  </fieldset>
                )}

                {step === 1 && (
                  <div className="workshop-notebook workshop-fields">
                    <WorkshopDateField
                      value={details.preferredDate}
                      today={studioCalendar.format(new Date())}
                      error={fieldErrors.preferredDate}
                      onChange={(value) => updateDetail("preferredDate", value)}
                    />
                    <div className="workshop-group">
                      <label htmlFor="workshop-seat-count">Group size</label>
                      <div className="workshop-guest-control">
                        <button type="button" aria-label="Remove one guest" disabled={groupSize <= 1}
                          onClick={() => updateDetail("seatCount", String(Math.max(1, Math.trunc(groupSize) - 1)))}>−</button>
                        <input id="workshop-seat-count" name="seatCount" type="number" min="1" max={maxGroupSize}
                          step="1" required value={details.seatCount}
                          aria-invalid={Boolean(fieldErrors.seatCount)}
                          aria-describedby={fieldErrors.seatCount ? "workshop-guest-error" : undefined}
                          onChange={(event) => updateDetail("seatCount", event.target.value)} />
                        <button type="button" aria-label="Add one guest" disabled={groupSize >= maxGroupSize}
                          onClick={() => updateDetail("seatCount", String(Math.min(maxGroupSize, Math.max(1, Math.trunc(groupSize) + 1))))}>+</button>
                      </div>
                      {fieldErrors.seatCount && <p className="workshop-field-error" id="workshop-guest-error">{fieldErrors.seatCount}</p>}
                    </div>
                    <label>
                      <span id="workshop-name-label">Name</span>
                      <input name="contactName" aria-labelledby="workshop-name-label" autoComplete="name" maxLength={100} required
                        aria-invalid={Boolean(fieldErrors.contactName)}
                        aria-describedby={fieldErrors.contactName ? "workshop-name-error" : undefined}
                        value={details.contactName} onChange={(event) => updateDetail("contactName", event.target.value)} />
                      {fieldErrors.contactName && <span className="workshop-field-error" id="workshop-name-error">{fieldErrors.contactName}</span>}
                    </label>
                    <label>
                      <span id="workshop-phone-label">Phone number</span>
                      <input name="contactPhone" aria-labelledby="workshop-phone-label" type="tel" autoComplete="tel" maxLength={30}
                        aria-invalid={Boolean(fieldErrors.contactPhone)}
                        aria-describedby={fieldErrors.contactPhone ? "workshop-phone-error" : undefined} required
                        value={details.contactPhone} onChange={(event) => updateDetail("contactPhone", event.target.value)} />
                      {fieldErrors.contactPhone && <span className="workshop-field-error" id="workshop-phone-error">{fieldErrors.contactPhone}</span>}
                    </label>
                    <label className="workshop-notes">
                      Notes for the studio <span>(optional)</span>
                      <textarea name="notes" rows={2} maxLength={500} placeholder="E.g. We’re all first-time painters."
                        value={details.notes}
                        onChange={(event) => updateDetail("notes", event.target.value)} />
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <>
                    <dl className="workshop-review">
                      <div><dt>Workshop</dt><dd>{selected?.title}</dd></div>
                      <div><dt>Preferred date</dt><dd>{preferredDate && formatDate(preferredDate)}</dd></div>
                      <div><dt>Group size</dt><dd>{details.seatCount}</dd></div>
                      <div><dt>Name</dt><dd>{details.contactName.trim()}</dd></div>
                      <div><dt>Phone number</dt><dd>{details.contactPhone.trim()}</dd></div>
                      {details.notes.trim() && <div><dt>Notes</dt><dd>{details.notes.trim()}</dd></div>}
                    </dl>
                    <p className="workshop-review-note">We’ll call to confirm your workshop time and availability.</p>
                  </>
                )}

                {step === 1 && Object.values(fieldErrors).some(Boolean) && (
                  <p className="workshop-alert" role="alert">Check the marked fields before continuing.</p>
                )}
                {error && <p className="workshop-alert" role="alert">{error}</p>}
                <div className="workshop-actions">
                  {step > 0 && <button className="workshop-back" type="button" disabled={isSubmitting}
                    onClick={() => goTo(step - 1)}><span aria-hidden="true">←</span> Back</button>}
                  <button className="workshop-primary" type="submit" disabled={!selected || isSubmitting}>
                    {step === 0 ? "Continue to your visit" : step === 1 ? "Review request" : isSubmitting ? "Sending…" : isPreview ? "Finish preview" : "Send booking request"}
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
