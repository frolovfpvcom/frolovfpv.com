import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kontakt | Frolov FPV",
  description: "Skriv til Frolov FPV om dit næste projekt med FPV-dronefilm.",
};

export default function KontaktPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
