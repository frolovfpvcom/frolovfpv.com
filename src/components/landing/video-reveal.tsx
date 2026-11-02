"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: { left: "Ind i", right: "billedet", caption: "Panoram · 4K" },
  en: { left: "Into", right: "the shot", caption: "Panoram · 4K" },
};

/** A small rounded clip that grows to fill the whole screen as you scroll, while the words fly apart. */
export function VideoReveal() {
  const t = useT(texts);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const inset = useTransform(scrollYProgress, [0, 0.6], [24, 0]);
  const insetX = useTransform(scrollYProgress, [0, 0.6], [30, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.6], [36, 0]);
  const clipPath = useTransform(
    [inset, insetX, radius],
    ([y, x, r]) => `inset(${y}% ${x}% ${y}% ${x}% round ${r}px)`,
  );
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.25, 1]);
  const leftX = useTransform(scrollYProgress, [0, 0.6], ["0vw", "-60vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.6], ["0vw", "60vw"]);
  const wordsOpacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div style={{ clipPath }} className="absolute inset-0 will-change-[clip-path]">
          <motion.video
            style={{ scale }}
            src="/clips/panoram.mp4"
            poster="/clips/panoram.jpg"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-skov-950/50 via-transparent to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: wordsOpacity }}
          className="pointer-events-none relative z-10 flex w-full flex-col items-center gap-[2vw] px-4 text-[17vw] md:flex-row md:justify-center md:gap-[3vw] md:text-[9vw] font-black uppercase leading-none tracking-tighter text-ild-500 [text-shadow:0_4px_30px_rgba(13,28,9,0.25)]"
        >
          <motion.span style={{ x: leftX }}>{t.left}</motion.span>
          <motion.span style={{ x: rightX }}>{t.right}</motion.span>
        </motion.div>

        <motion.p
          style={{ opacity: captionOpacity }}
          className="absolute bottom-10 left-6 md:left-10 z-10 font-mono text-xs uppercase tracking-[0.3em] text-white/85"
        >
          {t.caption}
        </motion.p>
      </div>
    </section>
  );
}
