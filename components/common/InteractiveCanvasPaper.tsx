"use client";

import { useEffect, useRef } from "react";

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
    const LIFE_SPAN = 3000;

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
    const handleWindowMouseMove = (e: MouseEvent) => {
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
        if (dx * dx + dy * dy < 9) {
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
        if (segmentsRef.current.length > 180) {
          segmentsRef.current.shift();
        }

        if (pts.length > 4) {
          pts.shift();
        }

        // Awake render loop if it was asleep
        ensureRenderLoop();
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", updateRects);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawAreaRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
