import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Kontakt | Frolov FPV",
  description: "Skriv til Frolov FPV om dit næste projekt med FPV-dronefilm.",
};

export default function KontaktPage() {
  return (
    <>
      <main className="flex-1">
        <ContactForm />
      </main>
    </>
  );
}
