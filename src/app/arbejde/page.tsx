import type { Metadata } from "next";
import { SelectedWork } from "@/components/selected-work";

export const metadata: Metadata = {
  title: "Udvalgt arbejde | Frolov FPV",
  description: "Udvalgt arbejde fra Frolov FPV.",
};

export default function ArbejdePage() {
  return (
    <main className="flex flex-1 items-center bg-blaa-950 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(4,84,231,0.18),transparent)] px-6 pt-36 pb-24 md:pt-44">
      <SelectedWork />
    </main>
  );
}
