"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function BookingQr({ code }: { code: string }) {
  const [image, setImage] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const destination = new URL("/admin/bookings", window.location.origin);
    destination.searchParams.set("code", code);
    QRCode.toDataURL(destination.href, {
      width: 600,
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#411f15", light: "#ffffff" },
    }).then(result => {
      if (active) setImage(result);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [code]);

  return (
    <figure className="booking-qr">
      {image ? (
        <>
          {/* The locally generated data URL is the downloadable QR artwork. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} width={240} height={240} alt="QR code for the studio to look up your booking" />
          <a href={image} download={`snapart-booking-${code}.png`}>Download QR</a>
        </>
      ) : (
        <p role="status">{failed ? "QR unavailable. Keep your booking reference for the studio." : "Preparing your QR…"}</p>
      )}
      <figcaption>Show this QR at the studio to look up your booking. Your visit is pending confirmation.</figcaption>
    </figure>
  );
}
