"use client";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Cookies",
    paragraphs: [
      "frolovfpv.com bruger ikke cookies til sporing, statistik eller reklamer.",
      "Siden gemmer kun dit valg af sprog (dansk eller engelsk) lokalt i din browser, så du ikke skal vælge det igen næste gang. Det er nødvendigt for, at siden virker, som du forventer, og deles ikke med nogen.",
      "Hvis du skriver til mig via kontaktformularen, bruges dine oplysninger kun til at svare dig.",
      "Du kan altid slette de gemte data ved at rydde dine browserdata for siden.",
    ],
  },
  en: {
    title: "Cookies",
    paragraphs: [
      "frolovfpv.com does not use cookies for tracking, analytics or advertising.",
      "The site only stores your language choice (Danish or English) locally in your browser, so you don't have to pick it again next time. This is needed for the site to work as you expect and is not shared with anyone.",
      "If you write to me through the contact form, your details are only used to reply to you.",
      "You can delete the stored data at any time by clearing your browser data for the site.",
    ],
  },
};

export function CookiePolicy() {
  const t = useT(texts);
  return (
    <section className="px-6 pt-36 pb-24 md:pt-44">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8">{t.title}</h1>
        <div className="space-y-5 text-blaa-950/70 text-lg leading-relaxed">
          {t.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
