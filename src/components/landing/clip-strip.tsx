"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const clips = [
  { video: "/clips/peugeot/klip-1.mp4", image: "/clips/peugeot/klip-1.jpg" },
  { video: "/clips/panoram.mp4", image: "/clips/panoram.jpg" },
  { video: "/clips/peugeot/klip-2.mp4", image: "/clips/peugeot/klip-2.jpg" },
  { video: "/clips/peugeot/klip-3.mp4", image: "/clips/peugeot/klip-3.jpg" },
];

const texts = {
  da: {
    eyebrow: "Fra luften",
    title: "Scroll, og flyv med",
    cards: [
      { title: "Peugeot shenanigans", tag: "Reklame" },
      { title: "Panoram", tag: "Natur" },
      { title: "Rundt om bilen", tag: "Reklame" },
      { title: "Tæt på", tag: "Reklame" },
    ],
    next: "Dit projekt her?",
    cta: "Lad os tale",
  },
  en: {
    eyebrow: "From the air",
    title: "Scroll and fly along",
    cards: [
      { title: "Peugeot shenanigans", tag: "Commercial" },
      { title: "Panoram", tag: "Nature" },
      { title: "Around the car", tag: "Commercial" },
      { title: "Up close", tag: "Commercial" },
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
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const smoothX = useSpring(x, { stiffness: 140, damping: 30, mass: 0.4 });
  // the cards lean into the movement a little
  const skew = useTransform(useVelocity(smoothX), [-2000, 2000], [-4, 4]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={section} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mb-8 px-6 md:mb-12 md:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-blaa-500">{t.eyebrow}</p>
          <h2 className="mt-3 text-4xl md:text-6xl font-black tracking-tight">{t.title}</h2>
        </div>

        <motion.div ref={row} style={{ x: smoothX }} className="flex w-max gap-5 px-6 md:gap-8 md:px-16">
          {clips.map((clip, i) => (
            <motion.article
              key={clip.video}
              style={{ skewX: skew }}
              className="group relative h-[52svh] w-[78vw] shrink-0 overflow-hidden rounded-[28px] bg-blaa-900 shadow-[0_30px_80px_-30px_rgba(1,25,71,0.55)] md:h-[58svh] md:w-[42vw]"
            >
              <video
                src={clip.video}
                poster={clip.image}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                // the Peugeot clips have black side bars baked in; zoom just past them
                className="h-full w-full scale-[1.12] object-cover transition-transform duration-700 group-hover:scale-[1.2]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blaa-950/75 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white md:p-8">
                <div>
                  <p className="font-mono text-xs tracking-[0.3em] text-white/70">
                    {String(i + 1).padStart(2, "0")} · {t.cards[i].tag}
                  </p>
                  <h3 className="mt-2 text-2xl md:text-4xl font-black tracking-tight">{t.cards[i].title}</h3>
                </div>
              </div>
            </motion.article>
          ))}

          <motion.div
            style={{ skewX: skew }}
            className="relative flex h-[52svh] w-[78vw] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] bg-blaa-500 p-8 text-white md:h-[58svh] md:w-[34vw] md:p-10"
          >
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full bg-blaa-300/50 blur-2xl" />
            <p className="relative text-4xl md:text-6xl font-black tracking-tight leading-[1]">{t.next}</p>
            <GenieLink
              href="/kontakt"
              className="group relative inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-blaa-600 transition-transform duration-300 hover:scale-105"
            >
              {t.cta}
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </GenieLink>
          </motion.div>
        </motion.div>

        <div className="mx-6 mt-10 h-1 overflow-hidden rounded-full bg-blaa-100 md:mx-16">
          <motion.div style={{ width: progress }} className="h-full rounded-full bg-blaa-500" />
        </div>
      </div>
    </section>
  );
}
