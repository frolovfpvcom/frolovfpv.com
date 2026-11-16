"use client";

import { useT } from "@/lib/lang";

const texts = {
  da: {
    before: "FPV-droner kommer helt ",
    accent: "tæt",
    after: " på.",
    lead: "Derhen hvor almindelige droner ikke tør, som får folk til at sige wow. Dronefilm til reklame, ejendomme, events og natur.",
    tag: "Showreel",
  },
  en: {
    before: "FPV drones get right ",
    accent: "up close",
    after: ".",
    lead: "Where ordinary drones don't dare to go, which makes people say wow. Drone films for commercials, real estate, events and nature.",
    tag: "Showreel",
  },
};

/* The headline on white, and the intro video under it in a frame with a white margin.
   Nothing moves when the page scrolls; only the video plays. */
export function Hero() {
  const t = useT(texts);
  return (
    <header className="mx-auto max-w-[1360px] px-5 pt-24 md:px-10 md:pt-32">
      <div className="flex flex-col gap-6 pb-8 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10">
        <h1 className="font-serif text-[clamp(48px,7.4vw,112px)] leading-[0.98] md:max-w-[13ch]">
          {t.before}
          <em>{t.accent}</em>
          {t.after}
        </h1>
        <p className="max-w-[34ch] text-muted-foreground md:pb-3">{t.lead}</p>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted sm:aspect-[16/9] lg:aspect-[21/9]">
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
        <span className="absolute bottom-4 left-5 text-[13px] tracking-wide text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.45)]">
          {t.tag}
        </span>
      </div>
    </header>
  );
}
