"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { FpvIntro } from "@/components/front/fpv-intro";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const texts = {
  da: {
    before: "FPV-droner kommer helt ",
    accent: "tæt",
    after: " på.",
    cta: "Få et tilbud",
    more: "Se hvad jeg tilbyder",
  },
  en: {
    before: "FPV drones get right ",
    accent: "up close",
    after: ".",
    cta: "Get a quote",
    more: "See what I offer",
  },
};

/* First a 4 s tunnel of clips (FpvIntro) plays on top; then the intro video fills the whole
   first screen, edge to edge, with the menu and the buttons on top of it in white. Nothing moves when the page scrolls; only the video plays. */
export function Hero() {
  const t = useT(texts);
  const video = useRef<HTMLVideoElement>(null);
  // when the 4 s tunnel intro is over, the real intro video starts from the beginning
  const startVideo = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  return (
    <header className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-neutral-900 text-white">
      <FpvIntro onDone={startVideo} />
      <video
        ref={video}
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

      {/* darken the top for the menu and the bottom for the buttons */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

      {/* on phones the bottom padding keeps the buttons clear of the glass menu at the bottom.
          The headline is hidden from view (Peter wants only the video and the buttons here),
          but stays for search engines and screen readers. */}
      <div className="relative mx-auto flex h-full max-w-[1360px] flex-col justify-end px-5 pb-[calc(max(14px,env(safe-area-inset-bottom))+100px)] md:px-10 md:pb-12">
        <h1 className="sr-only">
          {t.before}
          {t.accent}
          {t.after}
        </h1>
        <div className="flex md:justify-end">
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
