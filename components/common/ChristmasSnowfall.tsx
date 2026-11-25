"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";

const Snowfall = dynamic(() => import("react-snowfall"), { ssr: false });

function subscribe(onChange: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  motion.addEventListener("change", onChange);
  document.addEventListener("visibilitychange", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    motion.removeEventListener("change", onChange);
    document.removeEventListener("visibilitychange", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getSnowflakeCount() {
  if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  return window.innerWidth < 768 ? 30 : 65;
}

const getServerCount = () => 0;

function SnowCrystals({ count }: { count: number }) {
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(48, 48);
    ctx.strokeStyle = "#7bbce0";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    for (let arm = 0; arm < 6; arm++) {
      ctx.save();
      ctx.rotate(arm * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -39);
      for (const offset of [19, 29]) {
        ctx.moveTo(-9, -offset + 7);
        ctx.lineTo(0, -offset);
        ctx.lineTo(9, -offset + 7);
      }
      ctx.stroke();
      ctx.restore();
    }
    const image = new Image();
    image.onload = () => setImages([image]);
    image.src = canvas.toDataURL("image/png");
    return () => { image.onload = null; };
  }, []);

  if (!images.length) return null;
  return (
    <Snowfall
      images={images}
      snowflakeCount={count}
      radius={[10, 18]}
      speed={[0.8, 1.8]}
      wind={[-0.25, 0.45]}
      rotationSpeed={[-0.35, 0.35]}
      opacity={[0.65, 0.95]}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

export function ChristmasSnowfall() {
  const count = useSyncExternalStore(subscribe, getSnowflakeCount, getServerCount);
  if (!count) return null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40 }}>
      <Snowfall
        snowflakeCount={count}
        color="#8ac6e7"
        radius={[1.5, 3.5]}
        speed={[1, 2.4]}
        wind={[-0.2, 0.5]}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      />
      <SnowCrystals count={Math.max(8, Math.round(count / 3))} />
    </div>
  );
}
