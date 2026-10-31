"use client";

import { Check, Plus } from "lucide-react";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/sections/page-header";
import { services } from "@/components/sections/services-data";
import { serviceMedia } from "@/lib/media";
import { useLang, useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Ydelser",
    title: "Det kan jeg flyve for dig",
    lead: "FPV-droner flyver, hvor almindelige droner og kameraer ikke kan følge med. Tæt på, hurtigt og i én flydende bevægelse.",
    faqEyebrow: "Spørgsmål",
    faqTitle: "Godt at vide",
    faq: [
      {
        q: "Hvad koster en optagelse?",
        a: "Det afhænger af opgaven, stedet og om du vil have råfiler eller en færdigklippet film. Skriv et par linjer om projektet, så får du et uforpligtende tilbud.",
      },
      {
        q: "Hvor langt ude skal jeg booke?",
        a: "Gerne et par uger før, så der er tid til at planlægge ruten og tjekke tilladelser. Har du travlt, så skriv alligevel. Nogle gange kan det lade sig gøre hurtigt.",
      },
      {
        q: "Hvor i landet flyver du?",
        a: "Jeg tager opgaver rundt om i Danmark. Skriv hvor optagelsen skal foregå, så finder vi ud af det.",
      },
      {
        q: "Hvad får jeg leveret?",
        a: "Enten en færdigklippet film klar til web og sociale medier, eller råfilerne, så dit eget team kan klippe. Det aftaler vi inden optagelsen.",
      },
    ],
  },
  en: {
    eyebrow: "Services",
    title: "What I can fly for you",
    lead: "FPV drones fly where regular drones and cameras can't keep up. Close, fast and in one fluid move.",
    faqEyebrow: "Questions",
    faqTitle: "Good to know",
    faq: [
      {
        q: "What does a shoot cost?",
        a: "It depends on the job, the location and whether you want raw files or a finished edit. Write a few lines about the project and you'll get a quote with no obligation.",
      },
      {
        q: "How far ahead should I book?",
        a: "Ideally a couple of weeks ahead, so there's time to plan the route and check permissions. If you're in a hurry, write anyway. Sometimes it can happen fast.",
      },
      {
        q: "Where in the country do you fly?",
        a: "I take jobs around Denmark. Tell me where the shoot is and we'll work it out.",
      },
      {
        q: "What do I get delivered?",
        a: "Either a finished edit ready for web and social media, or the raw files so your own team can edit. We agree on it before the shoot.",
      },
    ],
  },
};

export function ServicesPage() {
  const { lang } = useLang();
  const t = useT(texts);
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          {services[lang].map((service, i) => (
            <section
              key={service.title}
              id={`ydelse-${i + 1}`}
              className="grid scroll-mt-28 items-center gap-10 border-t border-line py-16 md:grid-cols-2 md:gap-16 md:py-24"
            >
              <Reveal className={i % 2 ? "md:order-2" : ""}>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface">
                  <MediaSlot media={serviceMedia[i] ?? {}} alt={service.title} />
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="display mt-4 text-5xl md:text-6xl">{service.title}</h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{service.long}</p>
                <ul className="mt-8 space-y-3">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-3">
                      <Check size={18} aria-hidden="true" className="shrink-0 text-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </section>
          ))}
        </div>
      </div>

      <section className="border-t border-line bg-surface px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <Reveal>
            <Eyebrow>{t.faqEyebrow}</Eyebrow>
            <h2 className="display mt-5 text-5xl md:text-7xl">{t.faqTitle}</h2>
          </Reveal>
          <div className="border-t border-line">
            {t.faq.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold md:text-xl [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
