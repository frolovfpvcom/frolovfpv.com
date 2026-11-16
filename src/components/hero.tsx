"use client";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    before: "FPV-droner kommer helt ",
    accent: "tæt",
    after: " på.",
    lead: "Derhen hvor almindelige droner ikke tør, som får folk til at sige wow. Dronefilm til reklame, ejendomme, events og natur.",
    down: "Scroll for at se mere",
  },
  en: {
    before: "FPV drones get right ",
    accent: "up close",
    after: ".",
    lead: "Where ordinary drones don't dare to go, which makes people say wow. Drone films for commercials, real estate, events and nature.",
    down: "Scroll to see more",
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
        poster="/intro-4.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/* phones get a lighter 720p file, so the first screen starts quickly there too */}
        <source src="/intro-4-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/intro-4.mp4" type="video/mp4" />
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
        <div className="mt-6 flex flex-col gap-4 border-t border-white/30 pt-5 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[46ch] text-white/85">{t.lead}</p>
          <a href="#projekter" className="hidden text-sm text-white/85 hover:text-white md:block">
            {t.down} ↓
          </a>
        </div>
      </div>
    </header>
  );
}
