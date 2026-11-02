"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Det her er FPV",
    words:
      "Jeg flyver tæt på, hurtigt og lavt. Derhen hvor almindelige droner ikke tør, så dine billeder får folk til at sige wow.",
    highlight: ["tæt", "hurtigt", "lavt.", "wow."],
  },
  en: {
    eyebrow: "This is FPV",
    words:
      "I fly close, fast and low. Where ordinary drones don't dare to go, so your footage makes people say wow.",
    highlight: ["close,", "fast", "low.", "wow."],
  },
};

function Word({
  word,
  progress,
  range,
  highlight,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlight: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [18, 0]);
  return (
    <motion.span style={{ opacity, y }} className={`inline-block mr-[0.25em] ${highlight ? "text-ild-500" : ""}`}>
      {word}
    </motion.span>
  );
}

/** A big sentence whose words light up one by one as it scrolls past. */
export function Statement() {
  const t = useT(texts);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = t.words.split(" ");

  return (
    <section className="relative px-6 py-28 md:py-44 overflow-hidden">
      {/* soft blue light drifting behind the text */}
      <motion.div
        aria-hidden="true"
        animate={{ x: ["-10%", "10%", "-10%"], y: ["0%", "8%", "0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sol-200/60 blur-3xl"
      />
      <div ref={ref} className="mx-auto max-w-5xl">
        <p className="mb-8 text-xs font-bold uppercase tracking-[0.35em] text-ild-600">{t.eyebrow}</p>
        <p className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
          {words.map((w, i) => (
            <Word
              key={i}
              word={w}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
              highlight={t.highlight.includes(w)}
            />
          ))}
        </p>
      </div>
    </section>
  );
}
