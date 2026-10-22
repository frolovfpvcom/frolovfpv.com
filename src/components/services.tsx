"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Video, Building2, Mountain, Clapperboard } from "lucide-react";

const services = [
  {
    icon: Clapperboard,
    title: "Filmiske reels",
    description:
      "Energiske showreels og reklameindhold, der fanger publikum.",
  },
  {
    icon: Building2,
    title: "Ejendomme",
    description:
      "Dynamiske gennemflyvninger af boliger og ejendomme, inde og ude.",
  },
  {
    icon: Mountain,
    title: "Eventyr & rejser",
    description:
      "Episke luftperspektiver af landskaber, sport og ekspeditioner.",
  },
  {
    icon: Video,
    title: "Events",
    description:
      "Unikke FPV-vinkler til koncerter, festivaler og liveevents.",
  },
];

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 px-6 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Det laver jeg
          </h2>
          <p className="mt-3 text-neutral-400 max-w-md">
            Specialiserede FPV-droneydelser, skræddersyet til din kreative vision.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
            >
              <service.icon
                size={24}
                className="text-neutral-500 group-hover:text-white transition-colors duration-300 mb-4"
              />
              <h3 className="font-medium mb-2">{service.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
