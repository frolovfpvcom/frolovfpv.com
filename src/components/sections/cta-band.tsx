"use client";

import { Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/ui/reveal";
import { useT } from "@/lib/lang";

export const EMAIL = "peterfrolov09@gmail.com";

const texts = {
  da: {
    title: ["Klar til", "at lette?"],
    lead: "Fortæl mig om dit projekt, så vender jeg tilbage med idéer og en pris. Det er gratis og uforpligtende.",
    cta: "Book en flyvning",
  },
  en: {
    title: ["Ready for", "take-off?"],
    lead: "Tell me about your project and I'll get back to you with ideas and a price. It's free and with no obligation.",
    cta: "Book a flight",
  },
};

/** The closing call to action at the bottom of every page except /kontakt. */
export function CtaBand() {
  const t = useT(texts);
  return (
    <section className="relative overflow-hidden border-t border-line px-5 py-24 md:px-8 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <Reveal className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="display text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
          {t.title[0]}
          <br />
          <span className="text-accent">{t.title[1]}</span>
        </h2>
        <div className="max-w-sm">
          <p className="text-lg leading-relaxed text-muted">{t.lead}</p>
          <div className="mt-8 flex flex-col gap-4">
            <ButtonLink href="/kontakt" className="self-start">
              {t.cta}
            </ButtonLink>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex min-h-11 items-center gap-2.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Mail size={16} aria-hidden="true" />
              {EMAIL}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
