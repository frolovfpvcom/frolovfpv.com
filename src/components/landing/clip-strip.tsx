"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const clips = [
  { video: "/clips/peugeot/klip-1.mp4", image: "/clips/peugeot/klip-1.jpg" },
  // the same files as the big Panoram above, so it comes straight from the browser's cache
  { video: "/clips/panoram.mp4", mobile: "/clips/panoram-720.mp4", image: "/clips/panoram.jpg" },
  { video: "/clips/peugeot/klip-2.mp4", image: "/clips/peugeot/klip-2.jpg" },
  { video: "/clips/peugeot/klip-3.mp4", image: "/clips/peugeot/klip-3.jpg" },
];

const texts = {
  da: {
    eyebrow: "Fra luften",
    title: "Scroll, og flyv med",
    cards: [
      { title: "Peugeot shenanigans", tag: "4K" },
      { title: "Panoram", tag: "Natur" },
      { title: "Rundt om bilen", tag: "4K" },
      { title: "Mask på", tag: "4K" },
    ],
    next: "Dit projekt her?",
    cta: "Lad os tale",
  },
  en: {
    eyebrow: "From the air",
    title: "Scroll and fly along",
    cards: [
      { title: "Peugeot shenanigans", tag: "4K" },
      { title: "Panoram", tag: "Nature" },
      { title: "Around the car", tag: "4K" },
      { title: "Mask på", tag: "4K" },
    ],
    next: "Your project here?",
    cta: "Let's talk",
  },
};

/** Clips on a row that slides sideways while the page scrolls down. */
export function ClipStrip() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (row.current) setDistance(Math.max(0, row.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (row.current) ro.observe(row.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // The page scroll is already smoothed, so the row follows it directly: no extra spring
  // lagging behind, and only a transform changes, which the GPU moves without repainting.
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = scrollYProgress;

  // Only the clips on screen play; the rest pause, so the phone isn't decoding four videos at once.
  useEffect(() => {
    const videos = Array.from(row.current?.querySelectorAll("video") ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "0px 25% 0px 25%" },
    );
    videos.forEach((v) => io.observe(v));
    // Nothing is fetched on arrival; the clips start loading when the row gets close.
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        videos.forEach((v) => (v.preload = "auto"));
        near.disconnect();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    if (section.current) near.observe(section.current);
    return () => {
      io.disconnect();
      near.disconnect();
    };
  }, []);

  return (
    <section ref={section} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mb-8 px-6 md:mb-12 md:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-ild-600">{t.eyebrow}</p>
          <h2 className="mt-3 text-4xl md:text-6xl font-black tracking-tight">{t.title}</h2>
        </div>

        <motion.div ref={row} style={{ x }} className="flex w-max gap-5 px-6 will-change-transform md:gap-8 md:px-16">
          {clips.map((clip, i) => (
            <article
              key={clip.video}
              className="group relative h-[52svh] w-[78vw] shrink-0 overflow-hidden rounded-[28px] bg-skov-900 shadow-[0_30px_80px_-30px_rgba(58,53,41,0.55)] md:h-[58svh] md:w-[42vw]"
            >
              <video
                poster={clip.image}
                muted
                loop
                playsInline
                preload="none"
                // the Peugeot clips have black side bars baked in; zoom just past them
                className="h-full w-full scale-[1.12] object-cover transition-transform duration-700 group-hover:scale-[1.2]"
              >
                {"mobile" in clip && clip.mobile ? (
                  <source src={clip.mobile} type="video/mp4" media="(max-width: 767px)" />
                ) : null}
                <source src={clip.video} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-skov-950/75 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white md:p-8">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] text-white/70">
                    {String(i + 1).padStart(2, "0")} · {t.cards[i].tag}
                  </p>
                  <h3 className="mt-2 text-2xl md:text-4xl font-black tracking-tight">{t.cards[i].title}</h3>
                </div>
              </div>
            </article>
          ))}

          <div
            className="relative flex h-[52svh] w-[78vw] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] bg-primary p-8 text-primary-foreground md:h-[58svh] md:w-[34vw] md:p-10"
          >
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full bg-ild-400/50 blur-2xl" />
            <p className="relative text-4xl md:text-6xl font-black tracking-tight leading-[1]">{t.next}</p>
            <GenieLink
              href="/kontakt"
              className="group relative inline-flex w-fit items-center gap-2 rounded-full bg-skov-900 px-6 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:scale-105"
            >
              {t.cta}
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </GenieLink>
          </div>
        </motion.div>

        <div className="mx-6 mt-10 h-1 overflow-hidden rounded-full bg-skov-100 md:mx-16">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left rounded-full bg-skov-500" />
        </div>
      </div>
    </section>
  );
}
