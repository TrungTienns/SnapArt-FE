"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface StrokeSegment {
  p0: Point;
  p1: Point;
  p2: Point;
  color: string;
  width: number;
  createdAt: number;
}

// Vibrant Artistic Acrylic / Watercolor Palette
const ART_PALETTE = [
  "#f2b8cb", // Pastel Rose
  "#ffbe0b", // Warm Amber
  "#fb5607", // Orange Coral
  "#ff006e", // Magenta Rose
  "#8338ec", // Violet
  "#3a86ff", // Bright Cobalt Blue
  "#06d6a0", // Emerald Green
  "#411f15", // Deep Espresso
];

interface InteractiveCanvasPaperProps {
  /** Bounding element whose rect defines the allowed drawing area.
   *  If not provided, the full canvas is used (legacy behaviour). */
  drawAreaRef?: React.RefObject<HTMLElement | null>;
}

export function InteractiveCanvasPaper({ drawAreaRef }: InteractiveCanvasPaperProps) {
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentsRef = useRef<StrokeSegment[]>([]);
  const pointsBufferRef = useRef<Point[]>([]);
  const lastColorIndexRef = useRef<number>(0);
  const lastWidthRef = useRef<number>(12);
  const animationFrameRef = useRef<number | null>(null);
  const isLoopRunningRef = useRef<boolean>(false);

  // Cache bounding rects to avoid forced synchronous layout reflows during mousemove
  const cachedCanvasRectRef = useRef<DOMRect | null>(null);
  const cachedDrawRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const updateRects = () => {
      cachedCanvasRectRef.current = canvas.getBoundingClientRect();
      if (drawAreaRef?.current) {
        cachedDrawRectRef.current = drawAreaRef.current.getBoundingClientRect();
      } else {
        cachedDrawRectRef.current = cachedCanvasRectRef.current;
      }
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x to avoid massive 4K fillrate drops
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
      ctx.scale(dpr, dpr);
      updateRects();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("scroll", updateRects, { passive: true });

    // Life duration before full disappearance (3s)
    const LIFE_SPAN = drawingEnabled ? 6000 : 3000;

    const render = () => {
      const now = performance.now();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      const activeSegments: StrokeSegment[] = [];
      const segments = segmentsRef.current;
      const len = segments.length;

      for (let i = 0; i < len; i++) {
        const seg = segments[i];
        const age = now - seg.createdAt;

        if (age < LIFE_SPAN) {
          const progress = age / LIFE_SPAN;
          const opacity = Math.max(0, 1 - progress * progress);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(seg.p0.x, seg.p0.y);
          ctx.quadraticCurveTo(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y);

          ctx.strokeStyle = seg.color;
          ctx.lineWidth = seg.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = opacity;
          ctx.stroke();
          ctx.restore();

          activeSegments.push(seg);
        }
      }

      segmentsRef.current = activeSegments;

      // STOP RAF loop when no segments are active, saving 100% idle CPU & GPU cycles
      if (activeSegments.length > 0) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        isLoopRunningRef.current = false;
        animationFrameRef.current = null;
      }
    };

    const ensureRenderLoop = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    // Listen to global window mousemove so mouse movement over ANY element
    // triggers drawing seamlessly, using cached rects to avoid layout reflows.
    let activePointer: number | null = null;

    const addPoint = (e: { clientX: number; clientY: number }) => {
      let canvasRect = cachedCanvasRectRef.current;
      let drawRect = cachedDrawRectRef.current;

      if (!canvasRect || !drawRect) {
        updateRects();
        canvasRect = cachedCanvasRectRef.current;
        drawRect = cachedDrawRectRef.current;
        if (!canvasRect || !drawRect) return;
      }

      // Fast boundary check using cached rects
      if (
        e.clientX < drawRect.left ||
        e.clientX > drawRect.right ||
        e.clientY < drawRect.top ||
        e.clientY > drawRect.bottom
      ) {
        pointsBufferRef.current = [];
        return;
      }

      const currentPoint: Point = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      };

      const pts = pointsBufferRef.current;

      // Throttle points: Ignore micro-movements < 3px to keep stroke count optimal
      if (pts.length > 0) {
        const last = pts[pts.length - 1];
        const dx = currentPoint.x - last.x;
        const dy = currentPoint.y - last.y;
        if (dx * dx + dy * dy < 1) {
          return;
        }
      }

      pts.push(currentPoint);

      if (pts.length >= 3) {
        const p0 = pts[pts.length - 3];
        const p1 = pts[pts.length - 2];
        const p2 = pts[pts.length - 1];

        const startPoint: Point = {
          x: (p0.x + p1.x) / 2,
          y: (p0.y + p1.y) / 2,
        };
        const endPoint: Point = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };

        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const targetWidth = Math.max(6, Math.min(15, 13 - dist * 0.15));
        lastWidthRef.current += (targetWidth - lastWidthRef.current) * 0.25;

        const currentColor =
          ART_PALETTE[Math.floor(lastColorIndexRef.current) % ART_PALETTE.length];
        lastColorIndexRef.current += 0.05;

        segmentsRef.current.push({
          p0: startPoint,
          p1: p1,
          p2: endPoint,
          color: currentColor,
          width: lastWidthRef.current,
          createdAt: performance.now(),
        });

        // Cap segments to prevent memory creep during prolonged fast drawing
        if (segmentsRef.current.length > 1200) {
          segmentsRef.current.shift();
        }

        if (pts.length > 4) {
          pts.shift();
        }

        // Awake render loop if it was asleep
        ensureRenderLoop();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      // Touch is handled separately to prevent native scrolling on mobile Safari.
      if (event.pointerType === "touch") return;
      if (event.pointerType !== "mouse" && event.pointerId !== activePointer) return;
      const samples = event.getCoalescedEvents?.() ?? [];
      for (const sample of samples.length ? samples : [event]) addPoint(sample);
    };

    let activeTouch: number | null = null;
    const startTouch = (event: TouchEvent) => {
      if (!drawingEnabled || activeTouch !== null || event.touches.length !== 1) return;
      const touch = event.changedTouches[0];
      activeTouch = touch.identifier;
      if (event.cancelable) event.preventDefault();
      updateRects();
      pointsBufferRef.current = [];
      addPoint(touch);
      const first = pointsBufferRef.current[0];
      if (first) pointsBufferRef.current.push({ ...first });
    };
    const moveTouch = (event: TouchEvent) => {
      if (activeTouch === null) return;
      if (event.cancelable) event.preventDefault();
      const touch = Array.from(event.touches).find(item => item.identifier === activeTouch);
      if (touch) addPoint(touch);
    };
    const endTouch = (event: TouchEvent) => {
      if (!Array.from(event.changedTouches).some(item => item.identifier === activeTouch)) return;
      activeTouch = null;
      pointsBufferRef.current = [];
    };

    const startStroke = (event: PointerEvent) => {
      if (!drawingEnabled || event.pointerType === "touch" || !event.isPrimary || event.button !== 0) return;
      activePointer = event.pointerId;
      pointsBufferRef.current = [];
      updateRects();
      canvas.setPointerCapture(event.pointerId);
      handlePointerMove(event);
      // Seed the curve so even a short swipe leaves a mark.
      const first = pointsBufferRef.current[0];
      if (first) pointsBufferRef.current.push({ ...first });
    };
    const endStroke = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      pointsBufferRef.current = [];
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("touchstart", startTouch, { passive: false });
    canvas.addEventListener("touchmove", moveTouch, { passive: false });
    canvas.addEventListener("touchend", endTouch);
    canvas.addEventListener("touchcancel", endTouch);
    canvas.addEventListener("pointerdown", startStroke);
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
    canvas.addEventListener("lostpointercapture", endStroke);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", updateRects);
      window.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("touchstart", startTouch);
      canvas.removeEventListener("touchmove", moveTouch);
      canvas.removeEventListener("touchend", endTouch);
      canvas.removeEventListener("touchcancel", endTouch);
      canvas.removeEventListener("pointerdown", startStroke);
      canvas.removeEventListener("pointerup", endStroke);
      canvas.removeEventListener("pointercancel", endStroke);
      canvas.removeEventListener("lostpointercapture", endStroke);
      pointsBufferRef.current = [];
      isLoopRunningRef.current = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    };
  }, [drawAreaRef, drawingEnabled]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-lenis-prevent={drawingEnabled || undefined}
        className={`banner-paint-canvas absolute inset-0 w-full h-full z-0${drawingEnabled ? " is-drawing" : ""}`}
      />
      <button
        type="button"
        className="banner-paint-toggle"
        aria-pressed={drawingEnabled}
        onClick={() => setDrawingEnabled(enabled => !enabled)}
      >
        <span className="banner-paint-label">
          <span lang="en">{drawingEnabled ? "Keep exploring" : "Make your mark"}</span>
          <small lang="vi">{drawingEnabled ? "Xong · cuộn tiếp" : "Chạm để vẽ"}</small>
        </span>
        <span className="banner-paint-mark" aria-hidden="true">{drawingEnabled ? "↓" : "↗"}</span>
      </button>
    </>
  );
}
