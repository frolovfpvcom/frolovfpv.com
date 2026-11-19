"use client";

import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const texts = {
  da: {
    before: "FPV-droner kommer helt ",
    accent: "tæt",
    after: " på.",
    lead: "Derhen hvor almindelige droner ikke tør, som får folk til at sige wow. Jeg laver FPV-dronefilm til virksomheder: indhold til sociale medier, one-takes og house tours.",
    cta: "Få et tilbud",
    more: "Se hvad jeg tilbyder",
  },
  en: {
    before: "FPV drones get right ",
    accent: "up close",
    after: ".",
    lead: "Where ordinary drones don't dare to go, which makes people say wow. I make FPV drone films for businesses: social media content, one-takes and house tours.",
    cta: "Get a quote",
    more: "See what I offer",
  },
};

/* The intro video fills the whole first screen, edge to edge, with the menu and the headline
   on top of it in white. Nothing moves when the page scrolls; only the video plays. */
export function Hero() {
  const t = useT(texts);
  return (
    <header className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-neutral-900 text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        // the first frame shows at once while the clip loads
        poster="/intro-5.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/* phones get a lighter 720p file, so the first screen starts quickly there too */}
        <source src="/intro-5-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/intro-5.mp4" type="video/mp4" />
      </video>

      {/* darken the top for the menu and the bottom for the headline */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      {/* on phones the bottom padding keeps the text clear of the glass menu at the bottom */}
      <div className="relative mx-auto flex h-full max-w-[1360px] flex-col justify-end px-5 pb-[calc(max(14px,env(safe-area-inset-bottom))+100px)] md:px-10 md:pb-12">
        <h1 className="font-serif text-[clamp(48px,7.4vw,112px)] leading-[0.98] md:max-w-[14ch]">
          {t.before}
          <em>{t.accent}</em>
          {t.after}
        </h1>
        <div className="mt-6 flex flex-col gap-5 border-t border-white/30 pt-5 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[52ch] text-white/85">{t.lead}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3">
            <GenieLink
              href="/kontakt"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-neutral-900 transition-colors hover:bg-white/85"
            >
              {t.cta}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </GenieLink>
            <a href="#ydelser" className="text-[15px] text-white/85 underline-offset-[6px] hover:text-white hover:underline">
              {t.more} ↓
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
