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
    // a dark blue band with the four steps as numbered tiles
    <section className="mt-24 bg-brand-deep text-white md:mt-32">
      <div className="mx-auto max-w-[1360px] px-5 py-20 md:px-10 md:py-28">
        <h2 className="font-serif text-[40px] leading-none md:text-[56px]">{t.title}</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4 lg:gap-5">
          {t.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06} className="rounded-2xl bg-white/[0.06] p-7 ring-1 ring-white/10">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand font-serif text-[24px] leading-none text-white">
                {i + 1}
              </span>
              <h3 className="mt-5 text-[20px]">{step.title}</h3>
              <p className="mt-1.5 max-w-[34ch] text-white/70">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
