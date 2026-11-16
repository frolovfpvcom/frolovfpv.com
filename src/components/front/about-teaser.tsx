"use client";

import { Reveal } from "@/components/ui/reveal";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    label: "Om mig",
    big: "Jeg hedder Peter, er 17 år og har fløjet FPV-droner i 3 år.",
    small: "Fra marker og skove til huse indefra og biler i fart. Kameraet kommer derhen, hvor andre droner ikke kan.",
    more: "Læs mere",
    alt: "Peter Frolov med FPV-briller på",
  },
  en: {
    label: "About me",
    big: "I'm Peter, I'm 17 and I've been flying FPV drones for 3 years.",
    small: "From fields and forests to the inside of houses and cars at speed. The camera goes where other drones can't.",
    more: "Read more",
    alt: "Peter Frolov wearing FPV goggles",
  },
};

/* A short "about me" with the portrait, so businesses see who they would be working with. */
export function AboutTeaser() {
  const t = useT(texts);
  return (
      <section className="mx-auto max-w-[1360px] px-5 pt-24 md:px-10 md:pt-32">
        <Reveal className="grid grid-cols-1 items-end gap-7 md:grid-cols-[320px_1fr] md:gap-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/portrait-fpv.jpg"
            alt={t.alt}
            loading="lazy"
            className="aspect-[4/5] w-3/5 rounded object-cover md:w-full"
          />
          <div>
            <p className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">{t.label}</p>
            <p className="mt-4 max-w-[20ch] font-serif text-[32px] leading-[1.12] md:text-[44px]">{t.big}</p>
            <p className="mt-6 max-w-[48ch] text-muted-foreground">{t.small}</p>
            <GenieLink href="/ommig" className="mt-6 inline-block border-b border-foreground pb-0.5 text-[15px]">
              {t.more}
            </GenieLink>
          </div>
        </Reveal>
      </section>
  );
}
