"use client";

import { motion } from "motion/react";
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

export function Hero() {
  const t = useT(texts);
  return (
    <section className="relative w-full overflow-hidden bg-black pt-20 md:pt-0 md:h-[100svh] md:min-h-[560px]">
      {/* On desktop the intro video fills the whole first screen with the menu and
          text on top. On phones it shows the full 16:9 frame under the menu, with
          the text below, so less of the picture is cropped away. */}
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative block aspect-video w-full object-cover md:absolute md:inset-0 md:h-full md:aspect-auto"
      >
        <source src="/intro-4.mp4" type="video/mp4" />
      </motion.video>

      {/* Darken the top for the menu and the bottom for the headline. */}
      <div className="absolute inset-x-0 top-0 hidden md:block h-40 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-10 pb-12 md:h-full md:justify-end md:pt-0 md:pb-16">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            {t.title}
            <br />
            <span className="text-neutral-400">{t.accent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-neutral-300 text-base md:text-lg max-w-md mx-auto"
          >
            {t.lead}
          </motion.p>
        </div>

        <motion.a
          href="#projekter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-label={t.down}
          className="mt-8 animate-bounce"
        >
          <ChevronDown size={24} className="text-neutral-300" />
        </motion.a>
      </div>
    </section>
  );
}
