"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Arrow, Heading, Marked, PenMark, Sheet, Write } from "@/components/front/notebook";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";
import type { Pt } from "@/lib/pen";

const texts = {
  da: {
    greeting: "Hej.",
    // *…* gets a pen underline, […] a pen oval
    bio: "Jeg hedder Peter, er 17 år og har fløjet FPV-droner i 3 år. Før det fløj jeg med fjernstyrede fly i mange år, men da jeg fandt FPV-dronerne, var jeg *solgt på stedet*. Den bedste måde at beskrive det på: forestil dig, at du er en fugl med [en topfart på 200 km/t]. Den følelse tager jeg med ind i *video til sociale medier*, one-takes og house tours, så jeres virksomhed bliver set.",
    traits: ["kreativ", "præcis", "modig", "pålidelig", "lærenem", "motiveret"],
    cta: "Få et tilbud",
    more: "Mere om mig",
    alt: "Peter Frolov med FPV-briller på hovedet og sin FPV-drone i hænderne",
  },
  en: {
    greeting: "Hello.",
    bio: "I'm Peter, I'm 17 and I've been flying FPV drones for 3 years. Before that I flew remote-controlled planes for years, but when I found FPV drones, I was *sold on the spot*. The best way to describe it: imagine you're a bird with [a top speed of 200 km/h]. That feeling is what I bring into *social media videos*, one-takes and house tours, so your business gets seen.",
    traits: ["creative", "precise", "bold", "reliable", "quick learner", "motivated"],
    cta: "Get a quote",
    more: "More about me",
    alt: "Peter Frolov with FPV goggles on his head, holding his FPV drone",
  },
};

/* Where each handwritten word sits around the photo (in a 500×520 box), and its arrow. */
const SPOTS: { at: Pt; a: Pt; b: Pt; bend: number }[] = [
  { at: [104, 40], a: [122, 60], b: [150, 94], bend: 0.22 },
  { at: [398, 38], a: [380, 58], b: [352, 94], bend: -0.22 },
  { at: [64, 226], a: [84, 248], b: [126, 262], bend: -0.3 },
  { at: [438, 300], a: [418, 282], b: [374, 270], bend: -0.28 },
  { at: [112, 488], a: [130, 468], b: [158, 438], bend: 0.25 },
  { at: [392, 490], a: [372, 470], b: [342, 440], bend: -0.25 },
];

/* Right under the intro video: Peter's photo in two sketchy pen boxes with words pointing at
   it, and "Hej." with a few lines about him. The photo is grey until you hover it. The hero
   button and the "Ydelser" menu link land here (id="ydelser"). */
export function Hello() {
  const t = useT(texts);
  const reduced = useReducedMotion();
  // the words and the photo drift a little against each other under the mouse
  // (setting a spring value glides it to the new number)
  const spring = { stiffness: 90, damping: 18 };
  const sx = useSpring(0, spring);
  const sy = useSpring(0, spring);
  const px = useSpring(0, spring);
  const py = useSpring(0, spring);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    sx.set(dx * 18);
    sy.set(dy * 14);
    px.set(-dx * 8);
    py.set(-dy * 6);
  };
  const leave = () => {
    sx.set(0);
    sy.set(0);
    px.set(0);
    py.set(0);
  };

  return (
    <Sheet id="ydelser">
      <div className="mg-two">
        <div className="mg-traits" data-ink onPointerMove={move} onPointerLeave={leave}>
          <motion.div className="mg-portrait" style={{ x: px, y: py }}>
            <div className="mg-portrait-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/peter-med-drone.jpg" alt={t.alt} loading="lazy" decoding="async" draggable={false} />
            </div>
            <PenMark kind="box" seed={21} padX={10} padY={10} />
            <PenMark kind="box" seed={22} padX={16} padY={16} delay={0.25} />
          </motion.div>
          <motion.div className="mg-trait-layer" style={{ x: sx, y: sy }}>
            <svg viewBox="0 0 500 520" className="mg-ink" aria-hidden="true">
              {t.traits.map((_, i) => (
                <Arrow key={i} a={SPOTS[i].a} b={SPOTS[i].b} bend={SPOTS[i].bend} head={8} delay={0.7 + i * 0.15} />
              ))}
            </svg>
            {t.traits.map((word, i) => (
              <span
                key={word}
                className="mg-trait mg-hand"
                style={{ left: `${SPOTS[i].at[0] / 5}%`, top: `${SPOTS[i].at[1] / 5.2}%` }}
              >
                <Write delay={0.5 + i * 0.15}>{word}</Write>
              </span>
            ))}
          </motion.div>
        </div>

        <div className="mg-hello-copy">
          <Heading text={t.greeting} seed={10} className="mg-h-hello" />
          <p className="mg-p mg-bio" data-ink>
            <Marked text={t.bio} seed={100} />
          </p>
          <div className="mg-hello-cta">
            <GenieLink href="/kontakt" className="group mg-btn">
              {t.cta}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </GenieLink>
            <GenieLink href="/ommig" className="mg-btn mg-btn-ghost">
              {t.more}
            </GenieLink>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
