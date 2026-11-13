"use client";

import { motion } from "motion/react";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Om mig",
    body: [
      "Goddag, mit navn er Peter, jeg er 17 år gammel og jeg flyver med Fpv droner, det har jeg gjort i 3 år nu.",
      "Førhen har jeg fløjet med fjernstyrede fly i en del år. Så stoppede jeg med det, og fandt Fpv droner. Jeg var solgt på stedet.",
      "Den bedste måde at beskrive hvordan det er at flyve sådan en drone er bare at få folk til at forstille sig hvordan det ville være hvis de var en fugl (med en topfart på 200 km/t) og flyve der oppe, i luften",
    ],
    alt: "Peter Frolov med FPV-briller på",
  },
  en: {
    title: "About me",
    body: [
      "Hi, my name is Peter, I'm 17 years old and I fly FPV drones. I've been doing it for 3 years now.",
      "Before that I flew remote-controlled planes for quite a few years. Then I stopped, and found FPV drones. I was sold on the spot.",
      "The best way to describe what flying a drone like that is like is to get people to imagine what it would be like if they were a bird (with a top speed of 200 km/h), flying up there in the air.",
    ],
    alt: "Peter Frolov wearing FPV goggles",
  },
};

export function About() {
  const t = useT(texts);
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="about" className="px-6 pt-36 pb-24 md:pt-44">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* the photo of Peter, plain and straight */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/portrait-fpv.jpg" alt={t.alt} draggable={false} className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-4xl md:text-6xl font-semibold tracking-tight"
          >
            {t.title}
          </motion.h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
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
