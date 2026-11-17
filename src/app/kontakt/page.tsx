import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { AboutTeaser } from "@/components/front/about-teaser";

export const metadata: Metadata = {
  title: "Kontakt | Frolov FPV",
  description: "Få et tilbud på FPV-dronefilm til sociale medier, one-takes eller house tours.",
};

export default function KontaktPage() {
  return (
    <>
      <main className="flex-1">
        <ContactForm />
        {/* who they are writing to: the short "about me" lives here, not on the front page */}
        <div className="px-6 pb-24 md:pb-32">
          <AboutTeaser className="mx-auto max-w-5xl border-t border-border pt-16 md:pt-20" />
        </div>
      </main>
    </>
  );
}
