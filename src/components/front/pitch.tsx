"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    label: "Hvorfor FPV?",
    title: "Folk scroller forbi det, de har set før. Det her har de ikke set.",
    lead: "En almindelig drone filmer oppefra. En FPV-drone flyver med: ind ad hoveddøren, gennem rummene, tæt forbi bilen og ud over taget, i ét flow. Det føles som at være der selv, og det er præcis den følelse, der får folk til at stoppe, se videoen færdig og tage kontakt.",
    forYou: "Det betyder for dig",
    cases: [
      {
        who: "Er du ejendomsmægler",
        text: "Køberne ser hele boligen i ét flow, som om de selv går rundt. Annoncen skiller sig ud fra de andre, og de, der booker fremvisning, ved allerede, hvad de kommer ud til.",
      },
      {
        who: "Har du butik, restaurant eller hotel",
        text: "Vis stemningen, ikke bare lokalerne. Én tur ind ad døren og gennem stedet siger mere end ti billeder, og den virker både på hjemmesiden og på sociale medier.",
      },
      {
        who: "Sælger du biler eller produkter",
        text: "FPV kan følge med i fart og komme helt tæt på, hvor en almindelig drone må holde afstand. Det giver klip, der stopper scrollet og viser produktet fra sin bedste side.",
      },
      {
        who: "Holder du events",
        text: "Ind over scenen, gennem publikum og op over det hele. Ét klip viser, hvor stort det var, og får folk til at ville med næste gang.",
      },
    ],
    vs: { normal: "Almindelig drone", fpv: "FPV-drone" },
    normal: ["Filmer oppefra og på afstand", "Flotte oversigtsbilleder", "Bliver udenfor"],
    fpv: ["Flyver tæt på og igennem tingene", "Fart og bevægelse, der føles levende", "Ind, igennem og ud igen i ét skud"],
    ask: "Fortæl mig om din virksomhed, så foreslår jeg, hvordan FPV viser den bedst.",
    cta: "Få et forslag",
  },
  en: {
    label: "Why FPV?",
    title: "People scroll past what they've seen before. They haven't seen this.",
    lead: "An ordinary drone films from above. An FPV drone flies along: in through the front door, through the rooms, close past the car and out over the roof, in one flow. It feels like being there yourself, and that feeling is exactly what makes people stop, watch to the end and get in touch.",
    forYou: "What it means for you",
    cases: [
      {
        who: "If you're an estate agent",
        text: "Buyers see the whole home in one flow, as if they were walking around themselves. The listing stands out from the rest, and the people who book a viewing already know what they're coming to.",
      },
      {
        who: "If you run a shop, restaurant or hotel",
        text: "Show the atmosphere, not just the rooms. One run in through the door and through the place says more than ten photos, and it works both on your website and on social media.",
      },
      {
        who: "If you sell cars or products",
        text: "FPV keeps up at speed and gets right up close, where an ordinary drone has to keep its distance. That gives clips that stop the scroll and show the product at its best.",
      },
      {
        who: "If you run events",
        text: "In over the stage, through the crowd and up above it all. One clip shows how big it was and makes people want to come next time.",
      },
    ],
    vs: { normal: "Ordinary drone", fpv: "FPV drone" },
    normal: ["Films from above and from a distance", "Nice overview shots", "Stays outside"],
    fpv: ["Flies up close and through things", "Speed and movement that feel alive", "In, through and back out in one shot"],
    ask: "Tell me about your business, and I'll suggest how FPV can show it best.",
    cta: "Get a suggestion",
  },
};

/* The pitch, as if Peter were standing in front of a customer: why FPV shots catch people,
   what that does for their kind of business, and how it differs from an ordinary drone. */
export function Pitch() {
  const t = useT(texts);
  return (
    <section className="mx-auto max-w-[1360px] px-5 pt-24 md:px-10 md:pt-32">
      <Reveal className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <p className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">{t.label}</p>
          <h2 className="mt-4 font-serif text-[40px] leading-[1.04] md:text-[64px]">{t.title}</h2>
        </div>
        <p className="self-end text-[18px] leading-relaxed text-muted-foreground md:text-[19px]">{t.lead}</p>
      </Reveal>

      <p className="mt-16 border-b border-border pb-4 text-[13px] uppercase tracking-[0.14em] text-muted-foreground md:mt-20">
        {t.forYou}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {t.cases.map((c, i) => (
          <Reveal
            key={c.who}
            delay={(i % 2) * 0.06}
            className={`border-b border-border py-8 md:py-10 ${i % 2 === 0 ? "md:pr-10" : "md:border-l md:pl-10"}`}
          >
            <h3 className="font-serif text-[30px] leading-[1.1] md:text-[36px]">{c.who}</h3>
            <p className="mt-3 max-w-[50ch] text-[17px] leading-relaxed text-muted-foreground">{c.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-border p-7 md:p-9">
          <p className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">{t.vs.normal}</p>
          <ul className="mt-4 space-y-3 text-[17px] text-muted-foreground">
            {t.normal.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true">–</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[#16181d] p-7 text-white md:p-9">
          <p className="text-[13px] uppercase tracking-[0.14em] text-white/60">{t.vs.fpv}</p>
          <ul className="mt-4 space-y-3 text-[17px]">
            {t.fpv.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="text-[#8fe0c6]">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <div className="mt-12 flex flex-col items-start gap-5 md:mt-14 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[44ch] font-serif text-[26px] leading-[1.2] md:text-[30px]">{t.ask}</p>
        <GenieLink
          href="/kontakt"
          className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-neutral-700"
        >
          {t.cta}
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </GenieLink>
      </div>
    </section>
  );
}
