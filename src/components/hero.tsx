"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Se verden",
    accent: "med nye øjne",
    lead: "FPV-perspektiver, der fortæller historier fra vinkler, du aldrig har set før.",
    down: "Gå til arbejde",
  },
  en: {
    title: "See the world",
    accent: "With new eyes",
    lead: "FPV perspectives that tell stories from angles you have never seen before.",
    down: "Go to work",
  },
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useT(texts);
  const ref = useRef<HTMLElement>(null);
  // One quiet effect only: the video drifts a little slower than the page as you scroll on.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-skov-950 text-white"
    >
      {/* The intro video fills the whole first screen, on phones as on desktop,
          with the menu and the headline on top of it. */}
      <motion.div
        style={{ y: videoY }}
        className="absolute inset-0 will-change-transform"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          // the first frame shows at once while the clip loads
          poster="/intro-4.jpg"
          className="block h-full w-full object-cover"
        >
          {/* phones get a lighter 720p file, so the first screen starts quickly there too */}
          <source src="/intro-4-720.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/intro-4.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Darken the top for the menu and the bottom for the headline. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-skov-950/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-skov-950/70 via-skov-950/10 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-16 md:pb-24"
      >
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
            {t.title}
            <br />
            <span className="text-white/75">{t.accent}</span>
          </h1>

          <p className="mt-6 text-white/80 text-base md:text-lg max-w-md mx-auto">{t.lead}</p>
        </div>

        <a
          href="#projekter"
          aria-label={t.down}
          className="mt-10 grid size-10 place-items-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-white/60 hover:text-white"
        >
          <ChevronDown size={20} />
        </a>
      </motion.div>
    </section>
  );
}
