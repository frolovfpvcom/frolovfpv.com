import type { Metadata } from "next";
import { AboutPage } from "@/components/sections/about";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Om mig | Frolov FPV",
  description: "Mød Peter Frolov, FPV-dronepilot og filmfotograf.",
};

export default function OmPage() {
  return (
    <main id="main" className="flex-1">
      <AboutPage />
      <CtaBand />
    </main>
  );
}
