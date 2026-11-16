"use client";

import { Reveal } from "@/components/ui/reveal";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Om mig",
    body: [
      "Goddag, mit navn er Peter, jeg er 17 år gammel og jeg flyver med Fpv droner, det har jeg gjort i 3 år nu.",
      "Førhen har jeg fløjet med fjernstyrede fly i en del år. Så stoppede jeg med det, og fandt Fpv droner. Jeg var solgt på stedet.",
      "Den bedste måde at beskrive hvordan det er at flyve sådan en drone er bare at få folk til at forstille sig hvordan det ville være hvis de var en fugl (med en topfart på 200 km/t) og flyve der oppe, i luften",
    ],
    alt: "Peter Frolov med FPV-briller på",
  },
  en: {
    title: "About me",
    body: [
      "Hi, my name is Peter, I'm 17 years old and I fly FPV drones. I've been doing it for 3 years now.",
      "Before that I flew remote-controlled planes for quite a few years. Then I stopped, and found FPV drones. I was sold on the spot.",
      "The best way to describe what flying a drone like that is like is to get people to imagine what it would be like if they were a bird (with a top speed of 200 km/h), flying up there in the air.",
    ],
    alt: "Peter Frolov wearing FPV goggles",
  },
};

export function About() {
  const t = useT(texts);

  return (
    <section id="about" className="px-5 pb-8 pt-32 md:px-10 md:pt-44">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/portrait-fpv.jpg"
          alt={t.alt}
          draggable={false}
          className="aspect-[4/5] w-full max-w-md rounded object-cover"
        />

        <Reveal>
          <h1 className="font-serif text-6xl leading-none md:text-8xl">{t.title}</h1>
          <div className="mt-8 max-w-[60ch] space-y-5 text-lg leading-relaxed text-muted-foreground">
            {t.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
