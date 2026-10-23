"use client";

import { motion } from "motion/react";

// A stick figure doing "the worm", facing right. It stays in place while the
// thin grey floor slides in towards it, so it looks like it crawls forward.
const DURATION = 1.6;
const FRAMES = 32;
const FLOOR_Y = 56;

// Points along the body from the feet (s = 0) to the shoulders (s = 1).
const SAMPLES = [0, 0.17, 0.34, 0.5, 0.67, 0.83, 1];
const xAt = (s: number) => 10 + s * 76;

// A soft hump that rolls from the feet to the shoulders once per loop.
function bodyY(s: number, t: number) {
  // Starts and ends off the body, so the loop joins without a jump.
  const centre = -0.45 + t * 1.9;
  const hump = Math.exp(-(((s - centre) / 0.2) ** 2));
  // Lift the chest a little more as the wave reaches it.
  const amp = 10 + 4 * s;
  return FLOOR_Y - amp * hump;
}

const round = (n: number) => Math.round(n * 100) / 100;

// Catmull-Rom through the samples, written as cubic Béziers so every frame has
// the same commands and motion can tween between them smoothly.
function smoothPath(points: [number, number][]) {
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

const frames = Array.from({ length: FRAMES + 1 }, (_, i) => i / FRAMES);
const body = frames.map((t) =>
  smoothPath(SAMPLES.map((s) => [xAt(s), bodyY(s, t)])),
);
const shoulderY = frames.map((t) => bodyY(1, t));
const headY = shoulderY.map((y) => round(y - 4));
const arm = shoulderY.map(
  (y) => `M86 ${round(y)} C90 ${round(y + 1)} 93 ${round((y + 59) / 2)} 96 59`,
);

const loop = { duration: DURATION, repeat: Infinity, ease: "linear" as const };

export function WormLoader({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} role="img" aria-label="Indlæser">
      <g
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <motion.path d={body[0]} animate={{ d: body }} transition={loop} />
        <motion.path d={arm[0]} animate={{ d: arm }} transition={loop} />
        <motion.circle cx={96} r={5} cy={headY[0]} animate={{ cy: headY }} transition={loop} />
      </g>
      {/* the floor: gaps in the line show it sliding left, towards the figure */}
      <motion.line
        x1={0}
        y1={61}
        x2={120}
        y2={61}
        stroke="#a3a3a3"
        strokeWidth={1}
        strokeDasharray="24 4"
        animate={{ strokeDashoffset: [0, 28] }}
        transition={{ duration: DURATION, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}
