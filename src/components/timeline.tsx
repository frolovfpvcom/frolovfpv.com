"use client";

import { useT } from "@/lib/lang";

const texts = {
  da: { label: "Tidslinje", title: "Min rejse som FPV drone pilot indtil nu", alt: "Portræt af Peter Frolov" },
  en: { label: "Timeline", title: "My journey as an FPV drone pilot so far", alt: "Portrait of Peter Frolov" },
};

export function Timeline() {
  const t = useT(texts);
  return (
    <section id="tidslinje" className="relative w-full py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs text-neutral-500 uppercase tracking-[0.3em] mb-6">
          {t.label}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          {t.title}
        </h2>
      </div>

      <div className="mt-16 px-6">
        <div className="mx-auto aspect-square w-full max-w-56 overflow-hidden rounded-2xl border border-white/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/portrait.jpg"
            alt={t.alt}
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
