"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
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

/* Right after the intro video: the screen holds still on white while one word at a time slams
   into the middle and out again as you scroll. The last word stays, and a quote button appears
   under it. With reduced motion the whole sentence just stands there. */
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

  const sentence = t.words.join(" ");
  const last = index === n - 1;

  if (reduced) {
    return (
      <section className="flex min-h-[70svh] flex-col items-center justify-center bg-white px-5 py-24 text-center">
        <p className="max-w-[16ch] text-[clamp(40px,7vw,96px)] font-black uppercase leading-[0.95] tracking-tight">
          {sentence}
        </p>
      </section>
    );
  }

  return (
    <section ref={section} aria-label={sentence} className="relative h-[260vh] md:h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-5">
        <div aria-hidden="true" className="relative flex h-[40svh] w-full items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${index}-${t.words[index]}`}
              initial={{ scale: 2.4, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.4, opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.16, ease: [0.2, 0.9, 0.3, 1.2] }}
              className="absolute whitespace-nowrap font-black uppercase leading-none tracking-tight"
              style={{ fontSize: wordSize(t.words[index], last) }}
            >
              {t.words[index]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* a thin line that fills up word by word */}
        <div aria-hidden="true" className="mt-6 flex gap-1.5">
          {t.words.map((w, i) => (
            <span
              key={`${i}-${w}`}
              className={`h-1 w-5 rounded-full transition-colors duration-150 md:w-7 ${i <= index ? "bg-black" : "bg-black/10"}`}
            />
          ))}
        </div>

        <motion.div
          initial={false}
          animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-10"
          style={{ pointerEvents: done ? "auto" : "none" }}
        >
          <GenieLink
            href="/kontakt"
            tabIndex={done ? 0 : -1}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-700"
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
