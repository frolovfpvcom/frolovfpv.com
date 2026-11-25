import type { Metadata } from "next";
import { Ydelser } from "@/components/ydelser";

export const metadata: Metadata = {
  title: "Ydelser | Frolov FPV",
  description:
    "FPV-dronevideo til sociale medier, one-takes og house tours. Se hvordan det foregår: vi snakker sammen, jeg flyver, jeg klipper, og du får videoen.",
};

export default function YdelserPage() {
  return (
    <main className="flex-1">
      <Ydelser />
    </main>
  );
}
