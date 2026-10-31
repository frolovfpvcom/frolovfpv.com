import type { Metadata } from "next";
import { GalleryWall } from "@/components/gallery-wall";
import { SelectedWork } from "@/components/selected-work";

export const metadata: Metadata = {
  title: "Udvalgt arbejde | Frolov FPV",
  description: "Udvalgt arbejde fra Frolov FPV.",
};

export default function ArbejdePage() {
  return (
    <main className="flex flex-1 flex-col bg-black">
      <GalleryWall />
      <div className="px-6 pt-8 pb-24">
        <SelectedWork />
      </div>
    </main>
  );
}
