"use client";

import { useRef } from "react";
import { motion, useAnimate, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Det her er FPV",
    words:
      "Jeg flyver tæt på, hurtigt og lavt. Derhen hvor almindelige droner ikke tør, så dine billeder får folk til at sige wow.",
    highlight: ["tæt", "hurtigt", "lavt.", "wow."],
    wow: "wow.",
  },
  en: {
    eyebrow: "This is FPV",
    words:
      "I fly close, fast and low. Where ordinary drones don't dare to go, so your footage makes people say wow.",
    highlight: ["close,", "fast", "low.", "wow."],
    wow: "wow.",
  },
};

/** "wow." bounces twice the moment it lights up, then grows big, so the point lands. */
function Wow({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const [scope, animate] = useAnimate();
  const shown = useRef(false);

  useMotionValueEvent(progress, "change", (p) => {
    if (!shown.current && p >= range[1] - 0.002) {
      shown.current = true;
      animate(
        scope.current,
        { y: [0, -26, 0, -14, 0, 0], scale: [1, 1, 1, 1, 1, 1.65] },
        {
          duration: 1.15,
          times: [0, 0.18, 0.36, 0.5, 0.64, 1],
          ease: ["easeOut", "easeIn", "easeOut", "easeIn", [0.34, 1.56, 0.64, 1]],
        },
      );
    } else if (shown.current && p < range[0]) {
      // scrolled back up past it: shrink back so it can happen again
      shown.current = false;
      animate(scope.current, { y: 0, scale: 1 }, { duration: 0.3 });
    }
  });

  return (
    <Word word={word} progress={progress} range={range} highlight>
      <span ref={scope} className="inline-block" style={{ transformOrigin: "0% 85%" }}>
        {word}
      </span>
    </Word>
  );
}

function Word({
  word,
  progress,
  range,
  highlight,
  children,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlight: boolean;
  children?: React.ReactNode;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [18, 0]);
  return (
    <motion.span style={{ opacity, y }} className={`inline-block mr-[0.25em] ${highlight ? "text-ild-600" : ""}`}>
      {children ?? word}
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
      {/* soft warm light drifting behind the text */}
      <motion.div
        aria-hidden="true"
        animate={{ x: ["-10%", "10%", "-10%"], y: ["0%", "8%", "0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-popover/70 blur-3xl"
      />
      <div ref={ref} className="mx-auto max-w-5xl">
        <p className="mb-8 text-xs font-bold uppercase tracking-[0.35em] text-ild-600">{t.eyebrow}</p>
        <p className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
          {words.map((w, i) => {
            const range: [number, number] = [i / words.length, (i + 1) / words.length];
            return w === t.wow ? (
              <Wow key={i} word={w} progress={scrollYProgress} range={range} />
            ) : (
              <Word key={i} word={w} progress={scrollYProgress} range={range} highlight={t.highlight.includes(w)} />
            );
          })}
        </p>
      </div>
    </section>
  );
}
