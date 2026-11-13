"use client";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    a: ["Reklame", "Events", "Natur", "Ejendomme", "Musikvideo", "Sport"],
    b: ["Præcist", "Billedskønt", "Fly through", "4K"],
  },
  en: {
    a: ["Commercials", "Events", "Nature", "Real estate", "Music videos", "Sports"],
    b: ["Precise", "Stunning", "Fly through", "4K"],
  },
};

/** One straight, slow line of words between two hairlines. It glides at a steady pace
    (no tilt, no speed-up on scroll) and stands still for people who prefer less motion. */
export function Marquee() {
  const t = useT(texts);
  const words = [...t.a, ...t.b];
  const line = [...words, ...words];

  return (
    <section aria-label={words.join(", ")} className="border-y border-border py-6 md:py-8 overflow-hidden">
      <div className="flex w-max animate-[marquee_60s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden="true">
            {line.map((w, i) => (
              <span key={i} className="flex items-center text-xl md:text-3xl font-medium tracking-tight text-foreground/70">
                <span className="px-6 md:px-10">{w}</span>
                <span className="size-1.5 rounded-full bg-primary/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
