"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Video, Building2, Mountain, Clapperboard } from "lucide-react";

import { useT } from "@/lib/lang";

const icons = [Clapperboard, Building2, Mountain, Video];

const texts = {
  da: {
    title: "Det laver jeg",
    lead: "Specialiserede FPV-droneydelser, skræddersyet til din kreative vision.",
    services: [
      { title: "Filmiske reels", description: "Energiske showreels og reklameindhold, der fanger publikum." },
      { title: "Ejendomme", description: "Dynamiske gennemflyvninger af boliger og ejendomme, inde og ude." },
      { title: "Eventyr & rejser", description: "Episke luftperspektiver af landskaber, sport og ekspeditioner." },
      { title: "Events", description: "Unikke FPV-vinkler til koncerter, festivaler og liveevents." },
    ],
  },
  en: {
    title: "What I do",
    lead: "Specialised FPV drone services, tailored to your creative vision.",
    services: [
      { title: "Cinematic reels", description: "Energetic showreels and commercial content that grab the audience." },
      { title: "Real estate", description: "Dynamic fly-throughs of homes and properties, inside and out." },
      { title: "Adventure & travel", description: "Epic aerial perspectives of landscapes, sports and expeditions." },
      { title: "Events", description: "Unique FPV angles for concerts, festivals and live events." },
    ],
  },
};

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = useT(texts);

  return (
    <section className="relative py-32 px-6 border-t border-blaa-300/10 bg-[radial-gradient(60%_50%_at_15%_0%,rgba(4,84,231,0.14),transparent)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t.title}
          </h2>
          <p className="mt-3 text-neutral-400 max-w-md">{t.lead}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.services.map((service, i) => {
            const Icon = icons[i];
            return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group bg-blaa-900/30 border border-blaa-300/10 rounded-xl p-6 hover:bg-blaa-800/40 hover:border-blaa-400/40 transition-all duration-300"
            >
              <Icon
                size={24}
                className="text-blaa-300 group-hover:text-blaa-50 transition-colors duration-300 mb-4"
              />
              <h3 className="font-medium mb-2">{service.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
