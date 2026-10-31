"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { services } from "@/components/sections/services-data";
import { useLang, useT } from "@/lib/lang";

const texts = {
  da: { eyebrow: "Ydelser", title: "Det kan jeg flyve for dig", more: "Læs mere om" },
  en: { eyebrow: "Services", title: "What I can fly for you", more: "Read more about" },
};

/** Numbered list of services; each row links to /ydelser. */
export function ServicesTeaser() {
  const { lang } = useLang();
  const t = useT(texts);
  return (
    <section className="border-t border-line px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <Reveal>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="display mt-5 text-5xl md:text-7xl">{t.title}</h2>
        </Reveal>
        <ul className="border-t border-line">
          {services[lang].map((service, i) => (
            <li key={service.title} className="border-b border-line">
              <Link
                href={`/ydelser#ydelse-${i + 1}`}
                aria-label={`${t.more} ${service.title}`}
                className="group grid grid-cols-[3rem_1fr_auto] items-start gap-4 py-7 md:grid-cols-[4rem_1fr_auto] md:py-9"
              >
                <span className="pt-1.5 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                    {service.title}
                  </span>
                  <span className="mt-2 block max-w-lg text-muted">{service.short}</span>
                </span>
                <ArrowUpRight
                  size={22}
                  aria-hidden="true"
                  className="mt-1.5 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
