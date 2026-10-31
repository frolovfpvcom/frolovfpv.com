"use client";

import { Reveal } from "@/components/ui/reveal";
import { useT } from "@/lib/lang";

const values = ["50+", "12+", "3+"];

const texts = {
  da: ["Projekter", "Lokationer", "År i luften"],
  en: ["Projects", "Locations", "Years in the air"],
};

/** Three big numbers. */
export function Stats({ className = "" }: { className?: string }) {
  const labels = useT(texts);
  return (
    <dl className={`grid grid-cols-3 gap-4 ${className}`}>
      {values.map((value, i) => (
        <Reveal key={value} delay={i * 0.08} className="border-l border-line pl-4 md:pl-6">
          <dt className="sr-only">{labels[i]}</dt>
          <dd className="display text-5xl md:text-7xl">{value}</dd>
          <dd aria-hidden="true" className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:text-xs">
            {labels[i]}
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}
