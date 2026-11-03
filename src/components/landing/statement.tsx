"use client";

import { useRef } from "react";
import { motion, useAnimate, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    words:
      "Kom helt tæt på. Derhen hvor almindelige droner ikke tør, så dine billeder får folk til at sige wow.",
    highlight: ["tæt", "wow."],
    wow: "wow.",
  },
  en: {
    words:
      "Get right up close. Where ordinary drones don't dare to go, so your footage makes people say wow.",
    highlight: ["close.", "wow."],
    wow: "wow.",
  },
};

/** "wow." bounces twice the moment it lights up, then grows really big in the middle of the screen, so the point lands. */
function Wow({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const [scope, animate] = useAnimate();
  const shown = useRef(false);

  useMotionValueEvent(progress, "change", (p) => {
    if (!shown.current && p >= range[1] - 0.002) {
      shown.current = true;
      const el = scope.current as HTMLElement;
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      // 3x the old 1.65, but never wider than the screen
      const s = Math.min(4.95, (vw - 32) / r.width);
      // slide it to the middle of the screen while it grows, so it doesn't run off the side
      const dx = vw / 2 - (r.left + r.width / 2);
      animate(
        el,
        { y: [0, -26, 0, -14, 0, 0], x: [0, 0, 0, 0, 0, dx], scale: [1, 1, 1, 1, 1, s] },
        {
          duration: 1.15,
          times: [0, 0.18, 0.36, 0.5, 0.64, 1],
          ease: ["easeOut", "easeIn", "easeOut", "easeIn", [0.34, 1.56, 0.64, 1]],
        },
      );
    } else if (shown.current && p < range[0]) {
      // scrolled back up past it: shrink back so it can happen again
      shown.current = false;
      animate(scope.current, { y: 0, x: 0, scale: 1 }, { duration: 0.3 });
    }
  });

  return (
    <Word word={word} progress={progress} range={range} highlight>
      <span ref={scope} className="inline-block" style={{ transformOrigin: "50% 0%" }}>
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
  // all lit up, "wow." included, by the time the text sits in the middle of the screen
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.8"] });
  const words = t.words.split(" ");

  return (
    <section className="relative px-6 py-28 md:py-44 overflow-hidden">
      {/* soft warm light drifting behind the text. It is exactly as big as the section and has already
          faded to nothing at its own edge, so the section never cuts it off with a visible line,
          whatever the screen size. */}
      <motion.div
        aria-hidden="true"
        animate={{ x: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 11%, transparent) 0%, color-mix(in oklab, var(--primary) 7%, transparent) 30%, color-mix(in oklab, var(--primary) 3.5%, transparent) 55%, color-mix(in oklab, var(--primary) 1.2%, transparent) 75%, color-mix(in oklab, var(--primary) 0.4%, transparent) 90%, transparent 100%)",
        }}
      />
      <div ref={ref} className="mx-auto max-w-5xl">
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
      {/* room underneath for the big "wow." to grow into (outside ref, so the reveal timing stays put) */}
      <div aria-hidden="true" className="h-[3.2em] text-4xl md:text-6xl lg:text-7xl" />
    </section>
  );
}
