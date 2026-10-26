"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
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
  },
  en: {
    title: "About me",
    body: [
      "I'm an FPV drone pilot and cinematographer with a passion for capturing perspectives that push the limits of what aerial footage can tell.",
      "Every flight is a chance to create something unique — I weave through the surroundings with precision and creativity and deliver footage that feels immersive and alive.",
      "Whether it's chasing through mountain terrain, diving off buildings or gliding through interiors — I bring a cinematic eye to every project.",
    ],
    stats: ["Projects", "Locations", "Years in the air"],
  },
};

const stats = [
  { icon: Film, value: "50+" },
  { icon: Compass, value: "12+" },
  { icon: Zap, value: "3+" },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = useT(texts);

  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              {t.title}
            </h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed">
              {t.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center"
              >
                <stat.icon
                  size={22}
                  className="mx-auto mb-3 text-neutral-500"
                />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">
                  {t.stats[i]}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
