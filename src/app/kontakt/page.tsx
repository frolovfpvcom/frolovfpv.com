import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Kontakt | Frolov FPV",
  description: "Få et tilbud på FPV-dronefilm til sociale medier, one-takes eller house tours.",
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
