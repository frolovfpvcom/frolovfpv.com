import type { Metadata } from "next";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Contact } from "@/components/contact";

export const metadata: Metadata = {
  title: "Om mig | Frolov FPV",
  description: "Mød Peter Frolov, FPV-dronepilot og filmfotograf, og se hvad han laver.",
};

export default function OmMigPage() {
  return (
    <main className="flex-1">
      <About />
      <Services />
      <Contact />
    </main>
  );
}
