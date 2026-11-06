import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = pageMetadata({
  title: "Kontakt – book FPV-dronefilm",
  description:
    "Book en FPV-drone til dit næste projekt. Skriv til Peter Frolov hos Frolov FPV om dronefilm, one shots og gennemflyvninger i Danmark.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <>
      <main className="flex-1">
        <ContactForm />
      </main>
    </>
  );
}
