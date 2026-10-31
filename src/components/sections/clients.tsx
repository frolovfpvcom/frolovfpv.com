"use client";

import { clientLogos } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: { title: "Har fløjet for", logo: "Logo" },
  en: { title: "Has flown for", logo: "Logo" },
};

/** A quiet row of client logos under the hero. Empty entries show a placeholder. */
export function Clients() {
  const t = useT(texts);
  return (
    <section aria-label={t.title} className="border-b border-line px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:gap-12">
        <p className="shrink-0 font-mono text-xs uppercase tracking-[0.25em] text-subtle">{t.title}</p>
        <ul className="grid flex-1 grid-cols-3 gap-3 sm:grid-cols-5">
          {clientLogos.map((client, i) => (
            <li key={i} className="flex h-14 items-center justify-center">
              {client.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={client.logo}
                  alt={client.name}
                  loading="lazy"
                  className="max-h-9 w-auto max-w-[120px] object-contain opacity-60 grayscale transition-opacity hover:opacity-100"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                  {t.logo}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
