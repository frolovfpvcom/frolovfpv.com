"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal } from "@/components/ui/reveal";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    label: "Om mig",
    title: "Hej, jeg er Peter.",
    lead: "Jeg flyver FPV-droner og laver video, der får virksomheder set.",
    body: [
      "Jeg er 17 år og har fløjet FPV i 3 år. Før det fløj jeg med fjernstyrede fly i en del år, men da jeg fandt FPV-dronerne, var jeg solgt på stedet.",
      "Den bedste måde at beskrive det på: forestil dig, at du er en fugl med en topfart på 200 km/t. Den følelse tager jeg med ind i videoerne til jer.",
    ],
    offerLabel: "Det kan jeg lave for dig",
    offers: [
      "Video til sociale medier, der får folk til at stoppe op",
      "One-takes, hvor hele stedet vises i ét langt skud",
      "House tours til ejendomsmæglere",
    ],
    cta: "Få et tilbud",
    more: "Mere om mig",
    alt: "Peter Frolov med FPV-briller på hovedet og sin FPV-drone i hænderne",
  },
  en: {
    label: "About me",
    title: "Hi, I'm Peter.",
    lead: "I fly FPV drones and make videos that get businesses seen.",
    body: [
      "I'm 17 and have been flying FPV for 3 years. Before that I flew remote-controlled planes for quite a few years, but when I found FPV drones, I was sold on the spot.",
      "The best way to describe it: imagine you're a bird with a top speed of 200 km/h. That feeling is what I bring into the videos I make for you.",
    ],
    offerLabel: "What I can make for you",
    offers: [
      "Social media videos that make people stop scrolling",
      "One-takes that show the whole place in one long shot",
      "House tours for estate agents",
    ],
    cta: "Get a quote",
    more: "More about me",
    alt: "Peter Frolov with FPV goggles on his head, holding his FPV drone",
  },
};

/* Right under the intro video: a photo of Peter that rises up and opens out as you scroll
   down to it, and a few lines about who he is and what he makes. The hero button and the
   "Ydelser" menu link land here (id="ydelser"), since the text says what he offers. */
export function AboutIntro() {
  const t = useT(texts);
  const reduced = useReducedMotion();
  const photoRef = useRef<HTMLDivElement>(null);

  // 0 when the photo's top edge enters the bottom of the screen, 1 when it reaches a quarter down
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "start 0.25"] });
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const clip = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(16% 8% 0% 8% round 28px)", "inset(0% 0% 0% 0% round 28px)"],
  );
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);

  return (
    <section id="ydelser" className="overflow-hidden bg-brand-soft">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-[minmax(0,500px)_1fr] lg:gap-20">
        <motion.div
          ref={photoRef}
          style={reduced ? undefined : { y, scale, clipPath: clip }}
          className="relative mx-auto aspect-[3/4] w-full max-w-[460px] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(11,31,77,0.55)] lg:max-w-none"
        >
          <motion.img
            src="/images/peter-med-drone.jpg"
            alt={t.alt}
            draggable={false}
            loading="lazy"
            style={reduced ? undefined : { scale: imgScale }}
            // keep both his face and the drone in frame when the tall photo is cut to 3:4
            className="h-full w-full object-cover object-[50%_55%]"
          />
        </motion.div>

        <div>
          <Reveal>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-brand">{t.label}</p>
            <h2 className="mt-4 font-serif text-[48px] leading-[1.02] text-brand-deep md:text-[72px]">{t.title}</h2>
            <p className="mt-5 max-w-[30ch] font-serif text-[26px] leading-[1.2] text-brand-deep md:text-[32px]">
              {t.lead}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-8 max-w-[58ch] space-y-5 text-[18px] leading-relaxed text-brand-deep/70">
            {t.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>

          <Reveal delay={0.14} className="mt-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-brand">{t.offerLabel}</p>
            <ul className="mt-4 space-y-3 text-[17px] text-brand-deep">
              {t.offers.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="text-brand">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-3">
            <GenieLink
              href="/kontakt"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-brand-deep"
            >
              {t.cta}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </GenieLink>
            <GenieLink
              href="/ommig"
              className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-medium text-brand-deep ring-1 ring-brand-deep/20 transition-colors hover:bg-white"
            >
              {t.more}
            </GenieLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
