"use client";

import { ArrowUpRight, Building2, Car, Clapperboard, House, PartyPopper, Smartphone } from "lucide-react";
import { PerspectiveTunnel, type TunnelItem } from "@/components/ui/perspective-tunnel";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    kicker: "Flyv med",
    title: "Er du klar til at se, hvad FPV kan?",
    lead: "Jeg flyver FPV-droner og laver video, der får jeres virksomhed set. Det kan jeg hjælpe med:",
    offers: ["Reels og TikTok", "One-takes", "House tours", "Biler i fart", "Butikker og hoteller", "Events"],
    cta: "Få et tilbud",
    label: "Er du klar til at se, hvad FPV kan?",
    titles: [
      "Gennem loftet",
      "Ud ad vinduet",
      "Indendørs",
      "Blomstermarken",
      "Over trætoppene",
      "Testkørsel",
      "Bil i fart",
      "Følger bilen",
      "Tæt på bilen",
    ],
  },
  en: {
    kicker: "Fly along",
    title: "Ready to see what FPV can do?",
    lead: "I fly FPV drones and make video that gets your business seen. I can help with:",
    offers: ["Reels and TikTok", "One-takes", "House tours", "Cars at speed", "Shops and hotels", "Events"],
    cta: "Get a quote",
    label: "Ready to see what FPV can do?",
    titles: [
      "Through the attic",
      "Out the window",
      "Indoors",
      "Flower field",
      "Over the treetops",
      "Test drive",
      "Car at speed",
      "Chasing the car",
      "Up close",
    ],
  },
};

const icons = [Smartphone, Clapperboard, House, Car, Building2, PartyPopper];

/* Short 3-second loops of Peter's own FPV footage, cut to 4:5 for the cards. */
const clips = Array.from({ length: 9 }, (_, i) => ({
  video: `/tunnel/klip-${i + 1}.mp4`,
  poster: `/tunnel/klip-${i + 1}.jpg`,
}));

/* After the phones: a dark blue tunnel of Peter's clips that flies towards you while you
   scroll, past the question "Er du klar til at se, hvad FPV kan?". When the last clip has flown
   by, what he can help with and a button for a quote appear in the middle. */
export function FpvTunnel() {
  const t = useT(texts);
  const items: TunnelItem[] = clips.map((c, i) => ({ ...c, title: t.titles[i] }));
  return (
    <PerspectiveTunnel
      items={items}
      label={t.label}
      end={
        <div className="flex flex-col items-center">
          <p className="max-w-[40ch] text-[16px] leading-relaxed text-sky-100/85 md:text-[18px]">{t.lead}</p>
          <ul className="mt-5 flex max-w-[620px] flex-wrap justify-center gap-2">
            {t.offers.map((offer, i) => {
              const Icon = icons[i];
              return (
                <li
                  key={offer}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-white/10 px-3.5 py-2 text-[14px] text-white backdrop-blur-sm md:text-[15px]"
                >
                  <Icon size={15} className="text-sky-300" aria-hidden="true" />
                  {offer}
                </li>
              );
            })}
          </ul>
          <GenieLink
            href="/kontakt"
            className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-[#0b1f4d] transition-colors hover:bg-sky-100"
          >
            {t.cta}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </GenieLink>
        </div>
      }
    >
      <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.4em] text-sky-300">{t.kicker}</p>
      <h2 className="font-serif text-[clamp(44px,8vw,104px)] leading-[0.95]">
        {t.title}
      </h2>
    </PerspectiveTunnel>
  );
}
