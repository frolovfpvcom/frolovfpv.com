import type { Metadata } from "next";
import { WorkPage } from "@/components/sections/work-page";
import { ClipArchive } from "@/components/sections/clip-archive";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Arbejde | Frolov FPV",
  description: "Udvalgt arbejde fra Frolov FPV: FPV-dronefilm til reklamer, events og natur.",
};

export default function ArbejdePage() {
  return (
    <main id="main" className="flex-1">
      <WorkPage />
      <ClipArchive />
      <CtaBand />
    </main>
  );
}
