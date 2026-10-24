import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Udvalgt arbejde | Frolov FPV",
  description: "Udvalgt arbejde fra Frolov FPV.",
};

export default function ArbejdePage() {
  return (
    <>
      <main className="flex flex-1 items-center bg-black px-6 pt-36 pb-24 md:pt-44">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Udvalgt arbejde</h1>
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-neutral-400">
            Lige nu har jeg ikke noget udvalgt arbejde, MEN! Du kan blive den første! Kunne det
            ikke være lækkert at have din flotte video, som jeg laver for dig, rullende her?
          </p>
          <Link
            href="/kontakt"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black hover:bg-neutral-200 transition-colors duration-200"
          >
            Kontakt
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </main>
    </>
  );
}
