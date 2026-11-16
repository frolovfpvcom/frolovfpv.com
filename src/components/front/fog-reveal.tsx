"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: { lines: ["Ind ad døren.", "Gennem huset.", "Ud over taget."], alt: "FPV-drone flyver gennem et hus" },
  en: { lines: ["In through the door.", "Through the house.", "Out over the roof."], alt: "FPV drone flying through a house" },
};

/** One line of text that comes out of the fog between `from` and `to` (0–1 of the section). */
function FogLine({ progress, from, to, children }: { progress: MotionValue<number>; from: number; to: number; children: string }) {
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const blur = useTransform(progress, [from, to], [12, 0]);
  const y = useTransform(progress, [from, to], [18, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span style={{ opacity, filter, y }} className="block">
      {children}
    </motion.span>
  );
}

/* Right after the intro video: a white, misty screen where a clip slowly comes out of the fog
   while you scroll, and three short lines appear one by one. The screen stays put (sticky) while
   this happens, then the page carries on. With reduced motion everything is simply shown. */
export function FogReveal() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  // 0 when the section's top is 60 % down the screen, 1 when its end reaches the bottom
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start 0.6", "end end"] });

  const clipOpacity = useTransform(p, [0, 0.5], [0.1, 1]);
  const clipBlur = useTransform(p, [0, 0.55], [28, 0]);
  const clipScale = useTransform(p, [0, 0.6], [0.78, 1]);
  const clipFilter = useMotionTemplate`blur(${clipBlur}px)`;
  // the mist thins out but never quite goes, so the screen stays soft
  const fogOpacity = useTransform(p, [0, 0.7], [1, 0.35]);

  // only download and play the clip when the section is close to the screen
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} aria-label={t.lines.join(" ")} className={reduced ? "relative" : "relative h-[240vh]"}>
      <div
        className={`${reduced ? "py-24" : "sticky top-0 h-[100svh]"} flex flex-col items-center justify-center overflow-hidden bg-white px-5 md:px-10`}
      >
        {/* the fog: big soft white and pale grey clouds drifting slowly */}
        <motion.div aria-hidden="true" style={reduced ? { opacity: 0.35 } : { opacity: fogOpacity }} className="pointer-events-none absolute inset-0 z-10">
          <div className="fog-cloud fog-a" />
          <div className="fog-cloud fog-b" />
          <div className="fog-cloud fog-c" />
        </motion.div>

        <motion.div
          style={reduced ? undefined : { opacity: clipOpacity, filter: clipFilter, scale: clipScale }}
          className="relative w-full max-w-[1000px] overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_30px_80px_-30px_rgba(20,24,40,0.35)]"
        >
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            poster="/projekter/house-tour.jpg"
            aria-label={t.alt}
            className="aspect-[4/3] w-full object-cover md:aspect-[16/9]"
          >
            <source src="/clips/house-tour-720.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/clips/house-tour.mp4" type="video/mp4" />
          </video>
        </motion.div>

        <p className="relative z-20 mt-8 text-center font-serif text-[clamp(32px,4.6vw,64px)] leading-[1.05] md:mt-10 md:flex md:gap-[0.35em]">
          {reduced
            ? t.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            : t.lines.map((line, i) => (
                <FogLine key={line} progress={p} from={0.3 + i * 0.14} to={0.46 + i * 0.14}>
                  {line}
                </FogLine>
              ))}
        </p>
      </div>
    </section>
  );
}
