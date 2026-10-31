"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Sådan foregår det",
    title: "Fra idé til færdig film",
    steps: [
      { title: "Idé & plan", body: "Vi tager en snak om idéen, stedet og hvad filmen skal kunne. Du får et klart tilbud uden overraskelser." },
      { title: "Flyvning", body: "Jeg planlægger ruten, tjekker vejr og tilladelser og flyver optagelserne sikkert på dagen." },
      { title: "Levering", body: "Du får færdigklippet film eller råfiler, klar til web, sociale medier eller storskærm." },
    ],
  },
  en: {
    eyebrow: "How it works",
    title: "From idea to finished film",
    steps: [
      { title: "Idea & plan", body: "We talk about the idea, the location and what the film needs to do. You get a clear quote with no surprises." },
      { title: "Flight", body: "I plan the route, check weather and permissions and fly the shots safely on the day." },
      { title: "Delivery", body: "You get a finished edit or raw files, ready for web, social media or the big screen." },
    ],
  },
};

export function Process() {
  const t = useT(texts);
  return (
    <section className="border-t border-line bg-surface px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="display mt-5 text-4xl md:text-6xl">{t.title}</h2>
        </Reveal>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title} className="bg-surface p-8 md:p-10">
              <Reveal delay={i * 0.08}>
                <span className="display text-5xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
