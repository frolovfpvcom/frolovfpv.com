"use client";

import { animate, motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Compass, Zap, Film } from "lucide-react";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Om mig",
    body: [
      "Jeg er FPV-dronepilot og filmfotograf med en passion for at fange perspektiver, der rykker grænserne for, hvad luftoptagelser kan fortælle.",
      "Hver flyvning er en mulighed for at skabe noget unikt — jeg fletter mig gennem omgivelserne med præcision og kreativitet og leverer optagelser, der føles medrivende og levende.",
      "Uanset om det er jagt gennem bjergterræn, dyk ud over bygninger eller glidende flyvninger gennem interiører — bringer jeg et filmisk blik til hvert projekt.",
    ],
    stats: ["Projekter", "Lokationer", "År i luften"],
    eyebrow: "Hej, jeg hedder Peter",
    alt: "Portræt af Peter Frolov",
  },
  en: {
    title: "About me",
    body: [
      "I'm an FPV drone pilot and cinematographer with a passion for capturing perspectives that push the limits of what aerial footage can tell.",
      "Every flight is a chance to create something unique — I weave through the surroundings with precision and creativity and deliver footage that feels immersive and alive.",
      "Whether it's chasing through mountain terrain, diving off buildings or gliding through interiors — I bring a cinematic eye to every project.",
    ],
    stats: ["Projects", "Locations", "Years in the air"],
    eyebrow: "Hi, I'm Peter",
    alt: "Portrait of Peter Frolov",
  },
};

const stats = [
  { icon: Film, value: 50 },
  { icon: Compass, value: 12 },
  { icon: Zap, value: 3 },
];

/** Counts up from 0 the first time it scrolls into view. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref}>{n}+</span>;
}

export function About() {
  const t = useT(texts);
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="about" className="px-6 pt-36 pb-24 md:pt-44">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* the photo of Peter, framed big with a blue glow behind it */}
        <motion.div
          ref={photoRef}
          initial={false}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 1, ease }}
          className="relative mx-auto w-full max-w-md"
        >
          <div aria-hidden="true" className="absolute -inset-6 rounded-[44px] bg-gradient-to-br from-sol-300 via-ild-400 to-skov-500 opacity-60 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border-[6px] border-white bg-skov-100 shadow-[0_40px_80px_-30px_rgba(24,46,16,0.6)]">
            <motion.img
              src="/images/portrait.jpg"
              alt={t.alt}
              draggable={false}
              style={{ y: photoY, scale: 1.18 }}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        <div>
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-xs font-bold uppercase tracking-[0.35em] text-ild-600"
          >
            {t.eyebrow}
          </motion.p>
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="mt-4 text-5xl md:text-7xl font-black tracking-tight"
          >
            {t.title}
          </motion.h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-skov-950/75">
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

          <div className="mt-10 grid grid-cols-3 gap-3 md:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1, ease }}
                whileHover={{ y: -6, rotate: i === 1 ? 0 : i === 0 ? -2 : 2 }}
                className="rounded-3xl bg-white p-5 text-center shadow-[0_20px_40px_-25px_rgba(24,46,16,0.45)] md:p-6"
              >
                <stat.icon size={22} className="mx-auto mb-3 text-skov-500" />
                <p className="text-3xl font-black text-skov-950">
                  <CountUp to={stat.value} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-skov-900/55">{t.stats[i]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
