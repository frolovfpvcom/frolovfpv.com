"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const clips = [
  { video: "/clips/pande-ram.mp4", mobile: "/clips/pande-ram-720.mp4", image: "/clips/pande-ram.jpg" },
];

const texts = {
  da: {
    eyebrow: "Fra luften",
    title: "Scroll, og flyv med",
    cards: [
      { title: "Panoram", tag: "Natur" },
    ],
    next: "Dit projekt her?",
    cta: "Lad os tale",
  },
  en: {
    eyebrow: "From the air",
    title: "Scroll and fly along",
    cards: [
      { title: "Panoram", tag: "Nature" },
    ],
    next: "Your project here?",
    cta: "Let's talk",
  },
};

/** The clip(s) and a "your project here?" card side by side. No scroll-jacking:
    the page scrolls normally and a clip only plays while it is on screen. */
export function ClipStrip() {
  const t = useT(texts);
  const grid = useRef<HTMLDivElement>(null);

  // Only clips on screen play, and nothing is fetched until the grid gets close.
  useEffect(() => {
    const videos = Array.from(grid.current?.querySelectorAll("video") ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            v.preload = "auto";
            v.play().catch(() => {});
          } else v.pause();
        }
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <section className="px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-muted-foreground">{t.eyebrow}</p>
        <h2 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">{t.title}</h2>

        <div ref={grid} className="mt-10 grid gap-5 md:mt-12 md:grid-cols-[1.6fr_1fr] md:gap-6">
          {clips.map((clip, i) => (
            <article
              key={clip.video}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-skov-900 md:aspect-auto md:h-[30rem]"
            >
              <video poster={clip.image} muted loop playsInline preload="none" className="h-full w-full object-cover">
                {"mobile" in clip && clip.mobile ? (
                  <source src={clip.mobile} type="video/mp4" media="(max-width: 767px)" />
                ) : null}
                <source src={clip.video} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-skov-950/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                <p className="text-sm text-white/75">{t.cards[i].tag}</p>
                <h3 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">{t.cards[i].title}</h3>
              </div>
            </article>
          ))}

          <div className="flex min-h-48 md:min-h-64 flex-col justify-between rounded-2xl border border-border bg-card p-8 md:p-10">
            <p className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">{t.next}</p>
            <GenieLink
              href="/kontakt"
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-skov-700"
            >
              {t.cta}
              <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </GenieLink>
          </div>
        </div>
      </div>
    </section>
  );
}
