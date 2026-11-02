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
    <section className="px-6 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-skov-950/70 max-w-md">{t.lead}</p>
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
              className="group rounded-3xl bg-white p-7 shadow-[0_20px_40px_-25px_rgba(24,46,16,0.45)] transition-all duration-300 hover:-translate-y-2 hover:bg-skov-800 hover:text-white hover:shadow-[0_30px_60px_-25px_rgba(24,46,16,0.8)]"
            >
              <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-sol-100 text-skov-700 transition-colors duration-300 group-hover:bg-sol-400 group-hover:text-skov-950">
                <Icon size={24} />
              </span>
              <h3 className="text-lg font-bold mb-2">{service.title}</h3>
              <p className="text-sm text-skov-950/65 leading-relaxed transition-colors duration-300 group-hover:text-white/85">
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
