import type { Metadata } from "next";
import { SelectedWork } from "@/components/selected-work";

export const metadata: Metadata = {
  title: "Udvalgt arbejde | Frolov FPV",
  description: "Udvalgt arbejde fra Frolov FPV.",
};

export default function ArbejdePage() {
  return (
    <main className="flex-1 pb-24 pt-36 md:pb-32 md:pt-44">
      <div className="px-6">
        <SelectedWork />
      </div>
    </main>
  );
}
