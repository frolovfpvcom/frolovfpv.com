import type { Metadata } from "next";
import { SelectedWork } from "@/components/selected-work";
import { Work } from "@/components/work";

export const metadata: Metadata = {
  title: "Udvalgt arbejde | Frolov FPV",
  description: "Udvalgt arbejde fra Frolov FPV.",
};

export default function ArbejdePage() {
  return (
    <main className="flex-1 pt-36 md:pt-44">
      <div className="px-6">
        <SelectedWork />
      </div>
      <Work />
    </main>
  );
}
