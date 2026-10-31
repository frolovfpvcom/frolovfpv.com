import type { Metadata } from "next";
import { ServicesPage } from "@/components/sections/services-page";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Ydelser | Frolov FPV",
  description: "FPV-dronefilm til reklamer og brands, events og koncerter, ejendomme og natur.",
};

export default function YdelserPage() {
  return (
    <main id="main" className="flex-1">
      <ServicesPage />
      <CtaBand />
    </main>
  );
}
