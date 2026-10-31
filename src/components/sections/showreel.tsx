"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";
import { showreel } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Showreel",
    title: "Et minut i luften",
    lead: "Det hurtigste overblik over, hvad en FPV-drone kan gøre for din film.",
    slot: "Plads til showreel",
  },
  en: {
    eyebrow: "Showreel",
    title: "One minute in the air",
    lead: "The quickest look at what an FPV drone can do for your film.",
    slot: "Space for showreel",
  },
};

export function Showreel() {
  const t = useT(texts);
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="display mt-5 text-4xl md:text-6xl">{t.title}</h2>
          </div>
          <p className="max-w-sm text-muted md:text-right">{t.lead}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
            <MediaSlot media={showreel} controls label={t.slot} alt={t.eyebrow} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
