"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Om mig",
    body: [
      "Jeg er FPV-dronepilot og filmfotograf med en passion for at fange perspektiver, der rykker grænserne for, hvad luftoptagelser kan fortælle.",
      "Hver flyvning er en mulighed for at skabe noget unikt — jeg fletter mig gennem omgivelserne med præcision og kreativitet og leverer optagelser, der føles medrivende og levende.",
      "Uanset om det er jagt gennem bjergterræn, dyk ud over bygninger eller glidende flyvninger gennem interiører — bringer jeg et filmisk blik til hvert projekt.",
    ],
    alt: "Peter Frolov med FPV-briller på",
  },
  en: {
    title: "About me",
    body: [
      "I'm an FPV drone pilot and cinematographer with a passion for capturing perspectives that push the limits of what aerial footage can tell.",
      "Every flight is a chance to create something unique — I weave through the surroundings with precision and creativity and deliver footage that feels immersive and alive.",
      "Whether it's chasing through mountain terrain, diving off buildings or gliding through interiors — I bring a cinematic eye to every project.",
    ],
    alt: "Peter Frolov wearing FPV goggles",
  },
};

export function About() {
  const t = useT(texts);
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="about" className="px-6 pt-36 pb-24 md:pt-44">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* the photo of Peter, framed big with a warm glow behind it */}
        <motion.div
          ref={photoRef}
          initial={false}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 1, ease }}
          className="relative mx-auto w-full max-w-md"
        >
          <div aria-hidden="true" className="absolute -inset-6 rounded-[44px] bg-gradient-to-br from-sol-300 via-ild-400 to-skov-500 opacity-60 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border-[6px] border-popover bg-skov-100 shadow-[0_40px_80px_-30px_rgba(58,53,41,0.6)]">
            <motion.img
              src="/images/portrait-fpv.jpg"
              alt={t.alt}
              draggable={false}
              style={{ y: photoY, scale: 1.18 }}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        <div>
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            {t.title}
          </motion.h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/75">
            {t.body.map((p, i) => (
              <motion.p
                key={p}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.1, ease }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
