"use client";

import { Reveal } from "@/components/ui/reveal";
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
  const t = useT(texts);

  return (
    <section className="px-5 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-8 border-b border-border pb-4 md:mb-10">
          <h2 className="font-serif text-[40px] leading-none md:text-[56px]">{t.title}</h2>
          <p className="mt-3 max-w-md text-muted-foreground">{t.lead}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {t.services.map((service, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={service.title} delay={(i % 2) * 0.06} className="flex gap-5 border-b border-border py-7">
                <Icon size={22} strokeWidth={1.5} className="mt-1 shrink-0" />
                <div>
                  <h3 className="text-[22px]">{service.title}</h3>
                  <p className="mt-1.5 max-w-[46ch] text-muted-foreground">{service.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
