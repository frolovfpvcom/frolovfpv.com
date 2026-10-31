"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MediaSlot } from "@/components/ui/media-slot";
import { Reveal } from "@/components/ui/reveal";
import { Stats } from "@/components/sections/stats";
import { behindTheScenes, portrait } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Om mig",
    title: ["Piloten bag", "brillerne"],
    teaser:
      "Jeg hedder Peter og er FPV-dronepilot og filmfotograf. Jeg fanger perspektiver, der rykker grænserne for, hvad luftoptagelser kan fortælle.",
    more: "Mere om mig",
    alt: "Portræt af Peter Frolov",
    body: [
      "Jeg er FPV-dronepilot og filmfotograf med en passion for at fange perspektiver, der rykker grænserne for, hvad luftoptagelser kan fortælle.",
      "Hver flyvning er en mulighed for at skabe noget unikt. Jeg fletter mig gennem omgivelserne med præcision og kreativitet og leverer optagelser, der føles medrivende og levende.",
      "Uanset om det er jagt gennem bjergterræn, dyk ud over bygninger eller glidende flyvninger gennem interiører, bringer jeg et filmisk blik til hvert projekt.",
    ],
    bts: "Plads til billede bag kulisserne",
    journey: "Min rejse som FPV-dronepilot",
    journeyLead: "Historien om, hvordan jeg kom i luften, og hvor jeg er på vej hen, kommer her snart.",
  },
  en: {
    eyebrow: "About me",
    title: ["The pilot behind", "the goggles"],
    teaser:
      "I'm Peter, an FPV drone pilot and cinematographer. I capture perspectives that push the limits of what aerial footage can tell.",
    more: "More about me",
    alt: "Portrait of Peter Frolov",
    body: [
      "I'm an FPV drone pilot and cinematographer with a passion for capturing perspectives that push the limits of what aerial footage can tell.",
      "Every flight is a chance to create something unique. I weave through the surroundings with precision and creativity and deliver footage that feels immersive and alive.",
      "Whether it's chasing through mountain terrain, diving off buildings or gliding through interiors, I bring a cinematic eye to every project.",
    ],
    bts: "Space for a behind-the-scenes photo",
    journey: "My journey as an FPV drone pilot",
    journeyLead: "The story of how I got into the air, and where I'm heading, is coming here soon.",
  },
};

/** Short "about" block on the front page, linking to /om. */
export function AboutTeaser() {
  const t = useT(texts);
  return (
    <section className="border-t border-line px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[0.8fr_1fr] lg:gap-20">
        <Reveal>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface">
            <MediaSlot media={portrait} kind="image" alt={t.alt} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="display mt-5 text-5xl md:text-7xl">
            {t.title[0]}
            <br />
            <span className="text-white/55">{t.title[1]}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{t.teaser}</p>
          <Stats className="mt-10" />
          <ButtonLink href="/om" variant="secondary" className="mt-10">
            {t.more}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

/** The whole /om page above the closing call to action. */
export function AboutPage() {
  const t = useT(texts);
  return (
    <>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pt-44">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_0.85fr] lg:gap-20">
          <Reveal>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h1 className="display mt-6 text-6xl sm:text-7xl lg:text-8xl">
              {t.title[0]}
              <br />
              <span className="text-white/55">{t.title[1]}</span>
            </h1>
            <div className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed text-muted">
              {t.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Stats className="mt-14" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface">
              <MediaSlot media={portrait} kind="image" alt={t.alt} priority />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="display text-5xl md:text-7xl">{t.journey}</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{t.journeyLead}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
              <MediaSlot media={behindTheScenes} kind="image" label={t.bts} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
