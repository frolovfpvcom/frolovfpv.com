"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/button-link";
import { heroMedia } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "FPV-dronefilm · Danmark",
    title: ["Se verden", "med nye øjne"],
    lead: "Filmiske FPV-optagelser til reklamer, events og brands. Jeg flyver tæt på, gennem og rundt om det, andre kun kan filme på afstand.",
    cta: "Book en flyvning",
    secondary: "Se arbejde",
    scroll: "Scroll",
  },
  en: {
    eyebrow: "FPV drone film · Denmark",
    title: ["See the world", "with new eyes"],
    lead: "Cinematic FPV footage for commercials, events and brands. I fly close to, through and around what others can only film from a distance.",
    cta: "Book a flight",
    secondary: "See work",
    scroll: "Scroll",
  },
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Viewfinder corners, like the frame in FPV goggles. */
function Corners() {
  const corner = "absolute size-6 border-white/50";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-6 hidden md:block lg:inset-10">
      <span className={`${corner} left-0 top-20 border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-20 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
      <span className="absolute left-10 top-[6.5rem] flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-white/80">
        <span className="rec-dot size-2 rounded-full bg-red-500" />
        REC
      </span>
      <span className="absolute right-10 top-[6.5rem] font-mono text-xs tracking-[0.2em] text-white/60">
        FROLOV FPV
      </span>
    </div>
  );
}

export function Hero() {
  const t = useT(texts);
  return (
    <section className="relative w-full overflow-hidden bg-black pt-16 md:h-[100svh] md:min-h-[640px] md:pt-0">
      {/* On desktop the intro video fills the whole first screen with the text on
          top. On phones it shows the full 16:9 frame, with the text below, so
          less of the picture is cropped away. */}
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        poster={heroMedia.image}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
        className="relative block aspect-video w-full object-cover md:absolute md:inset-0 md:h-full md:aspect-auto"
      >
        <source src={heroMedia.video} type="video/mp4" />
      </motion.video>

      <div className="absolute inset-0 hidden bg-gradient-to-t from-black via-black/30 to-black/20 md:block" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-transparent to-transparent md:block" />
      <Corners />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-5 pb-14 pt-10 md:h-full md:justify-end md:px-8 md:pb-24 lg:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-white/80"
        >
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          {t.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="display mt-5 text-[3.4rem] sm:text-7xl md:text-8xl lg:text-[8.5rem]"
        >
          {t.title[0]}
          <br />
          <span className="text-white/55">{t.title[1]}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mt-7 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-lg text-base leading-relaxed text-white/80 md:text-lg">{t.lead}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/kontakt">{t.cta}</ButtonLink>
            <ButtonLink href="/arbejde" variant="secondary" arrow={false}>
              {t.secondary}
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
