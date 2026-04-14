"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Seeded random number generator (deterministic blobs per seed)
// ---------------------------------------------------------------------------
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Blob SVG path generator (organic shapes)
// ---------------------------------------------------------------------------
function generateBlobPath(
  points: number,
  radius: number,
  variance: number,
  seed: number
): string {
  const rng = seededRandom(seed);
  const angleStep = (Math.PI * 2) / points;
  const coords: { x: number; y: number }[] = [];

  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    const r = radius + (rng() - 0.5) * 2 * variance;
    coords.push({
      x: Math.cos(angle) * r + radius + variance,
      y: Math.sin(angle) * r + radius + variance,
    });
  }

  // Build smooth cubic bezier path
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length; i++) {
    const current = coords[i];
    const next = coords[(i + 1) % coords.length];
    const prev = coords[(i - 1 + coords.length) % coords.length];
    const nextNext = coords[(i + 2) % coords.length];

    const cp1x = current.x + (next.x - prev.x) / 6;
    const cp1y = current.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (nextNext.x - current.x) / 6;
    const cp2y = next.y - (nextNext.y - current.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  d += " Z";
  return d;
}

// ---------------------------------------------------------------------------
// Wave SVG path generator
// ---------------------------------------------------------------------------
function generateWavePath(
  width: number,
  height: number,
  waves: number,
  amplitude: number,
  seed: number,
  position: "top" | "bottom" = "bottom"
): string {
  const rng = seededRandom(seed);
  const segmentWidth = width / waves;
  const baseY = position === "bottom" ? height * 0.6 : height * 0.4;

  let d = position === "bottom"
    ? `M 0 ${height} L 0 ${baseY}`
    : `M 0 0 L 0 ${baseY}`;

  for (let i = 0; i < waves; i++) {
    const x1 = segmentWidth * i + segmentWidth * 0.33;
    const x2 = segmentWidth * i + segmentWidth * 0.66;
    const x3 = segmentWidth * (i + 1);

    const cp1y = baseY + (rng() - 0.5) * amplitude * 2;
    const cp2y = baseY + (rng() - 0.5) * amplitude * 2;
    const endY = baseY + (rng() - 0.3) * amplitude;

    d += ` C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x3} ${endY}`;
  }

  d += position === "bottom"
    ? ` L ${width} ${height} Z`
    : ` L ${width} 0 Z`;

  return d;
}

// ---------------------------------------------------------------------------
// Component: <Blob />
// ---------------------------------------------------------------------------
export interface BlobProps {
  /** Number of control points (default: 6) */
  points?: number;
  /** Base radius (default: 200) */
  radius?: number;
  /** Shape variance/irregularity (default: 40) */
  variance?: number;
  /** Deterministic seed (default: 42) */
  seed?: number;
  /** Fill color or gradient (default: brand teal) */
  color?: string;
  /** Second color for gradient fill */
  gradientTo?: string;
  /** Opacity 0-1 (default: 0.1) */
  opacity?: number;
  /** Optional className for the SVG wrapper */
  className?: string;
  /** Whether to animate with CSS (default: false) */
  animate?: boolean;
}

export function Blob({
  points = 6,
  radius = 200,
  variance = 40,
  seed = 42,
  color = "#00B4A0",
  gradientTo,
  opacity = 0.1,
  className,
  animate = false,
}: BlobProps) {
  const path = useMemo(
    () => generateBlobPath(points, radius, variance, seed),
    [points, radius, variance, seed]
  );

  const size = (radius + variance) * 2;
  const gradientId = `blob-grad-${seed}`;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none select-none",
        animate && "animate-float",
        className
      )}
      style={{ opacity }}
    >
      {gradientTo && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
      )}
      <path
        d={path}
        fill={gradientTo ? `url(#${gradientId})` : color}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component: <WaveDivider />
// ---------------------------------------------------------------------------
export interface WaveDividerProps {
  /** Number of wave cycles (default: 4) */
  waves?: number;
  /** Wave amplitude in px (default: 40) */
  amplitude?: number;
  /** Total height in px (default: 120) */
  height?: number;
  /** Seed for shape (default: 1) */
  seed?: number;
  /** Fill color (default: white) */
  color?: string;
  /** Position of the solid area (default: "bottom") */
  position?: "top" | "bottom";
  /** className for wrapper */
  className?: string;
  /** Flip vertically */
  flip?: boolean;
}

export function WaveDivider({
  waves = 4,
  amplitude = 40,
  height = 120,
  seed = 1,
  color = "#FDFCFB",
  position = "bottom",
  className,
  flip = false,
}: WaveDividerProps) {
  const width = 1440;
  const path = useMemo(
    () => generateWavePath(width, height, waves, amplitude, seed, position),
    [width, height, waves, amplitude, seed, position]
  );

  return (
    <div
      className={cn(
        "w-full overflow-hidden leading-[0] pointer-events-none",
        flip && "rotate-180",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ display: "block", height }}
      >
        <path d={path} fill={color} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: <FloatingBlobs /> — decorative background
// ---------------------------------------------------------------------------
export function FloatingBlobs({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const blobs = useMemo(() => {
    const configs = [
      { seed: 42, radius: 250, color: "#00B4A0", gradientTo: "#4DDCCA", x: -10, y: -15, opacity: 0.08 },
      { seed: 77, radius: 200, color: "#C8A040", gradientTo: "#EDC45A", x: 60, y: 10, opacity: 0.06 },
      { seed: 99, radius: 180, color: "#00B4A0", gradientTo: "#C8A040", x: 30, y: 55, opacity: 0.05 },
      { seed: 123, radius: 150, color: "#4DDCCA", gradientTo: "#00B4A0", x: 75, y: -20, opacity: 0.07 },
    ];
    return configs.slice(0, count);
  }, [count]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.radius * 2,
            height: b.radius * 2,
          }}
        >
          <Blob
            seed={b.seed}
            radius={b.radius}
            variance={b.radius * 0.2}
            color={b.color}
            gradientTo={b.gradientTo}
            opacity={b.opacity}
            animate
          />
        </div>
      ))}
    </div>
  );
}
