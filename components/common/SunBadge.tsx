"use client";

interface SunBadgeProps {
  text: string;
  className?: string;
  spinDirection?: "normal" | "reverse";
}

export function SunBadge({ text, className = "", spinDirection = "normal" }: SunBadgeProps) {
  const textPathId = `circle-text-${text.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}>
      {/* Pastel Rose Sunburst Character */}
      <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[#f2b8cb] filter drop-shadow-sm"
          fill="currentColor"
        >
          {/* Spiky organic 14-point star like Pictoric illustration */}
          <polygon points="50,2 62,24 85,12 80,36 100,48 83,62 88,86 64,82 50,100 36,82 12,86 17,62 0,48 20,36 15,12 38,24" />
        </svg>

        {/* Hand-drawn whimsical face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[#411f15]">
          <div className="flex gap-2 items-center mb-0.5">
            <span className="w-1.5 h-1.5 bg-[#411f15] rounded-full inline-block"></span>
            <span className="w-1.5 h-1.5 bg-[#411f15] rounded-full inline-block"></span>
          </div>
          {/* cute squiggly mouth */}
          <svg className="w-4 h-2 text-[#411f15]" viewBox="0 0 16 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 3 Q 8 7 14 3" />
          </svg>
        </div>
      </div>

      {/* Rotating Circular Text Ribbon */}
      <svg
        viewBox="0 0 160 160"
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          spinDirection === "reverse" ? "animate-[spin_18s_linear_infinite_reverse]" : "animate-[spin_18s_linear_infinite]"
        }`}
      >
        <defs>
          <path
            id={textPathId}
            d="M 80, 80 m -62, 0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
          />
        </defs>
        <text
          className="text-[13px] font-black uppercase tracking-[0.28em] fill-[#411f15]"
        >
          <textPath href={`#${textPathId}`} startOffset="50%" textAnchor="middle">
            {text} • {text} •
          </textPath>
        </text>
      </svg>
    </div>
  );
}
