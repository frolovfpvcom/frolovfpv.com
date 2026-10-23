"use client";

import { MorphingSquare } from "@/components/ui/morphing-square";

export function Timeline() {
  return (
    <section id="tidslinje" className="relative w-full py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs text-neutral-500 uppercase tracking-[0.3em] mb-6">
          Tidslinje
        </p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          Min rejse som FPV drone pilot indtil nu
        </h2>
        <div className="mt-12">
          <MorphingSquare />
        </div>
      </div>

      <div className="mt-16 px-6">
        <div className="mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/portrait.jpg"
            alt="Portræt af Peter Frolov"
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
