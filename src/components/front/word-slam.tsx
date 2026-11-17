"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    words: ["Er", "du", "klar", "til", "at", "give", "din", "virksomhed", "et", "skub?!"],
    cta: "Få et tilbud",
  },
  en: {
    words: ["Ready", "to", "give", "your", "business", "a", "real", "push?!"],
    cta: "Get a quote",
  },
};

/** 0 before `from`, 1 after `to`, a straight line in between. */
const ramp = (v: number, from: number, to: number) => Math.min(1, Math.max(0, (v - from) / (to - from)));

/** As big as possible, but a long word still fits the width of a phone with a margin. */
const wordSize = (word: string, last: boolean) =>
  `min(${last ? 220 : 190}px, ${Math.min(24, 84 / (word.length * 0.68)).toFixed(1)}vw)`;

/* Shades of blue, from deep navy to sky. Each word gets its own pair for a soft gradient. */
const blues = [
  ["#0b1f5c", "#2f6bff"],
  ["#1d4ed8", "#60a5fa"],
  ["#0a3d91", "#38bdf8"],
  ["#1e3a8a", "#3b82f6"],
  ["#2563eb", "#7dd3fc"],
  ["#0c2d6b", "#4f8cff"],
];

/* Soft blue light drifting behind the words: each blob moves its own way as you scroll. */
const blobs = [
  { color: "#93c5fd", size: "48vmax", left: "-12%", top: "-18%", dx: 18, dy: 22 },
  { color: "#bfdbfe", size: "40vmax", left: "62%", top: "48%", dx: -22, dy: -18 },
  { color: "#7dd3fc", size: "30vmax", left: "38%", top: "-10%", dx: -10, dy: 30 },
];

/* Right after the intro video: the screen holds still on white while one word at a time rises
   up from below and fades in, in shades of blue, as you scroll; soft blue light drifts behind
   it. The last word stays, and a quote button appears under it. With reduced motion the whole
   sentence just stands there. */
export function WordSlam() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const n = t.words.length;

  // 0 when the section's top reaches the top of the screen, 1 when its end reaches the bottom
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // the words take the first 80 % of the scroll; the last one is held for the rest
    setIndex(Math.min(n - 1, Math.floor(ramp(v, 0, 0.8) * n)));
    setDone(v > 0.84);
  });

  const p = scrollYProgress;
  const b0x = useTransform(p, (v) => `${blobs[0].dx * v}vw`);
  const b0y = useTransform(p, (v) => `${blobs[0].dy * v}vh`);
  const b1x = useTransform(p, (v) => `${blobs[1].dx * v}vw`);
  const b1y = useTransform(p, (v) => `${blobs[1].dy * v}vh`);
  const b2x = useTransform(p, (v) => `${blobs[2].dx * v}vw`);
  const b2y = useTransform(p, (v) => `${blobs[2].dy * v}vh`);
  const moves = [
    { x: b0x, y: b0y },
    { x: b1x, y: b1y },
    { x: b2x, y: b2y },
  ];

  const sentence = t.words.join(" ");
  const last = index === n - 1;
  const [from, to] = blues[index % blues.length];

  if (reduced) {
    return (
      <section className="flex min-h-[70svh] flex-col items-center justify-center bg-white px-5 py-24 text-center">
        <p className="max-w-[16ch] text-[clamp(40px,7vw,96px)] font-black uppercase leading-[0.95] tracking-tight text-[#1d4ed8]">
          {sentence}
        </p>
      </section>
    );
  }

  return (
    <section ref={section} aria-label={sentence} className="relative h-[260vh] md:h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-5">
        {/* soft blue light in the background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {blobs.map((b, i) => (
            <motion.span
              key={b.color + b.left}
              className="absolute rounded-full opacity-60 blur-[90px]"
              style={{
                width: b.size,
                height: b.size,
                left: b.left,
                top: b.top,
                background: `radial-gradient(closest-side, ${b.color}, transparent)`,
                x: moves[i].x,
                y: moves[i].y,
              }}
            />
          ))}
        </div>

        <div aria-hidden="true" className="relative flex h-[40svh] w-full items-center justify-center">
          {/* a glow in the word's own blue, which changes with it */}
          <motion.span
            className="absolute h-[34svh] w-[min(80vw,900px)] rounded-full blur-[70px]"
            animate={{ backgroundColor: to, opacity: last ? 0.35 : 0.22 }}
            transition={{ duration: 0.6 }}
          />
          <AnimatePresence initial={false}>
            <motion.span
              key={`${index}-${t.words[index]}`}
              initial={{ y: "70%", opacity: 0, filter: "blur(12px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-45%", opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute whitespace-nowrap bg-clip-text pb-[0.08em] font-black uppercase leading-none tracking-tight text-transparent"
              style={{
                fontSize: wordSize(t.words[index], last),
                backgroundImage: `linear-gradient(120deg, ${from} 10%, ${to} 90%)`,
              }}
            >
              {t.words[index]}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.div
          initial={false}
          animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative mt-10"
          style={{ pointerEvents: done ? "auto" : "none" }}
        >
          <GenieLink
            href="/kontakt"
            tabIndex={done ? 0 : -1}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#1d4ed8] px-6 text-[15px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(29,78,216,0.6)] transition-colors hover:bg-[#1e3a8a]"
          >
            {t.cta}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </GenieLink>
        </motion.div>
      </div>
    </section>
  );
}
