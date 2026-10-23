"use client";

import { motion } from "motion/react";

// A stick figure doing "the worm", facing right. It stays in place while the
// thin grey floor slides in towards it, so it looks like it crawls forward.
const DURATION = 1.6;

// Body: feet → knees → hips → chest → shoulders. The wave runs from the feet to the head.
const body = [
  "M10 56 L30 56 L50 56 L70 56 L86 56",
  "M10 56 L30 46 L50 55 L70 56 L86 56",
  "M10 56 L30 54 L50 42 L70 55 L86 56",
  "M10 56 L30 56 L50 52 L70 43 L86 52",
  "M10 56 L30 56 L50 56 L70 52 L86 45",
  "M10 56 L30 56 L50 56 L70 56 L86 56",
];
const headY = [52, 52, 52, 49, 41, 52];
const arm = [
  "M86 56 L96 59",
  "M86 56 L96 59",
  "M86 56 L96 59",
  "M86 52 L96 59",
  "M86 45 L96 59",
  "M86 56 L96 59",
];

const loop = { duration: DURATION, repeat: Infinity, ease: "easeInOut" as const };

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
