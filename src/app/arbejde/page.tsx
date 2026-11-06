import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SelectedWork } from "@/components/selected-work";

export const metadata: Metadata = pageMetadata({
  title: "Udvalgt arbejde – FPV-dronefilm og one shots",
  description:
    "Se FPV-dronefilm fra Frolov FPV. Peter Frolov flyver one shots: gennemflyvninger af ejendomme, institutioner og virksomheder med FPV-drone, i ét uafbrudt skud.",
  path: "/arbejde",
});

export default function ArbejdePage() {
  return (
    <main className="flex-1 pb-24 pt-36 md:pb-32 md:pt-44">
      <div className="px-6">
        <SelectedWork />
      </div>
    </main>
  );
}
