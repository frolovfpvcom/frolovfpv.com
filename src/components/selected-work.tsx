"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Udvalgt arbejde",
    lead: "Lige nu har jeg ikke noget udvalgt arbejde, MEN! Du kan blive den første! Kunne det ikke være lækkert at have din flotte video, som jeg laver for dig, rullende her?",
    cta: "Kontakt",
  },
  en: {
    title: "Selected work",
    lead: "Right now I don't have any selected work, BUT! You could be the first! Wouldn't it be great to have the stunning video I make for you rolling right here?",
    cta: "Contact",
  },
};

export function SelectedWork() {
  const t = useT(texts);
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-8 text-lg md:text-xl leading-relaxed text-neutral-400">{t.lead}</p>
      <Link
        href="/kontakt"
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black hover:bg-neutral-200 transition-colors duration-200"
      >
        {t.cta}
        <ArrowUpRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </div>
  );
}
