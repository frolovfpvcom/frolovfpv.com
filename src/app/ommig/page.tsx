import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Contact } from "@/components/contact";

export const metadata: Metadata = pageMetadata({
  title: "Om mig – Peter Frolov, FPV-dronepilot",
  description:
    "Mød Peter Frolov, 17-årig FPV-dronepilot bag Frolov FPV. Han har fløjet FPV-droner i 3 år og laver dronefilm til reels, ejendomme, events og natur.",
  path: "/ommig",
});

export default function OmMigPage() {
  return (
    <main className="flex-1">
      <About />
      <Services />
      <Contact />
    </main>
  );
}
