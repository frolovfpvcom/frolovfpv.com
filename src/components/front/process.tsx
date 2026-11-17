"use client";

import { Reveal } from "@/components/ui/reveal";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Sådan foregår det",
    steps: [
      { title: "I skriver til mig", text: "Fortæl hvad I vil vise, hvor det er, og hvad videoen skal bruges til." },
      { title: "Idé og pris", text: "Jeg vender tilbage med et forslag til optagelsen og en pris." },
      { title: "Optagelse", text: "Vi aftaler en dag, og jeg flyver på stedet efter den rute, vi har planlagt." },
      { title: "Færdige filer", text: "I får klippene færdigredigeret, klar til hjemmeside, annoncer og sociale medier." },
    ],
  },
  en: {
    title: "How it works",
    steps: [
      { title: "You get in touch", text: "Tell me what you want to show, where it is and what the video is for." },
      { title: "Idea and price", text: "I come back with a plan for the shoot and a price." },
      { title: "The shoot", text: "We agree on a day, and I fly on location along the route we planned." },
      { title: "Finished files", text: "You get the clips fully edited, ready for your website, ads and social media." },
    ],
  },
};

/* Four plain steps, so a business can see there's nothing complicated about booking. */
export function Process() {
  const t = useT(texts);
  return (
    <section className="mx-auto max-w-[1360px] px-5 pt-24 md:px-10 md:pt-32">
      <div className="mb-8 border-b border-border pb-4 md:mb-10">
        <h2 className="font-serif text-[40px] leading-none md:text-[56px]">{t.title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.06} className="border-b border-border py-7 lg:border-b-0">
              <span className="font-serif text-[40px] leading-none text-muted-foreground">{i + 1}</span>
              <h3 className="mt-3 text-[20px]">{step.title}</h3>
              <p className="mt-1.5 max-w-[34ch] text-muted-foreground">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
