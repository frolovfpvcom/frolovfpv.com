"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { heroMedia } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "FPV-dronefilm · Danmark",
    title: "Se verden med nye øjne",
    lead: "Filmiske FPV-optagelser til reklamer, events og brands. Jeg flyver tæt på, gennem og rundt om det, andre kun kan filme på afstand.",
    cta: "Book en flyvning",
    secondary: "Se arbejde",
  },
  en: {
    eyebrow: "FPV drone film · Denmark",
    title: "See the world with new eyes",
    lead: "Cinematic FPV footage for commercials, events and brands. I fly close to, through and around what others can only film from a distance.",
    cta: "Book a flight",
    secondary: "See work",
  },
};

// how far each layer drifts down while the header scrolls away
const LAYERS = [
  { layer: "1", yPercent: 70 }, // the video, furthest back
  { layer: "3", yPercent: 40 }, // the big name
];

/**
 * Front-page header: the intro video and the name in separate layers that
 * move at different speeds as you scroll, fading into the page below.
 * Smooth scrolling (Lenis) runs only on the front page.
 */
export function Hero() {
  const t = useT(texts);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const trigger = rootRef.current?.querySelector<HTMLElement>("[data-parallax-layers]");
    const ctx = gsap.context(() => {
      if (!trigger) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger, start: "0% 0%", end: "100% 0%", scrub: 0 },
      });
      LAYERS.forEach(({ layer, yPercent }, i) => {
        tl.to(
          trigger.querySelectorAll(`[data-parallax-layer="${layer}"]`),
          { yPercent, ease: "none" },
          i === 0 ? undefined : "<",
        );
      });
    }, rootRef);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax" ref={rootRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div data-parallax-layers className="parallax__layers">
            <video
              data-parallax-layer="1"
              className="parallax__layer-img"
              autoPlay
              loop
              muted
              playsInline
              poster={heroMedia.image}
              aria-hidden="true"
            >
              <source src={heroMedia.video} type="video/mp4" />
            </video>
            <div className="parallax__shade" aria-hidden="true" />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <p className="parallax__title display" aria-hidden="true">
                Frolov FPV
              </p>
            </div>
          </div>
          <div className="parallax__fade" />
        </div>
      </section>

      <section className="parallax__content px-5 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="display mt-6 max-w-5xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl">{t.title}</h1>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-lg text-lg leading-relaxed text-muted">{t.lead}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/kontakt">{t.cta}</ButtonLink>
              <ButtonLink href="/arbejde" variant="secondary" arrow={false}>
                {t.secondary}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
