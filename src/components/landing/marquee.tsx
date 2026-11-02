"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    a: ["Reklame", "Events", "Natur", "Ejendomme", "Musikvideo", "Sport"],
    b: ["Tæt på", "Hurtigt", "Lavt", "Filmisk", "Ét skud", "4K"],
  },
  en: {
    a: ["Commercials", "Events", "Nature", "Real estate", "Music videos", "Sports"],
    b: ["Up close", "Fast", "Low", "Cinematic", "One take", "4K"],
  },
};

/** An endless band of words. Scrolling speeds it up, and scrolling up turns it around. */
function Band({ words, base, className }: { words: string[]; base: number; className: string }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [10, -10]);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    const b = boost.get();
    if (b < -0.05) direction.current = -1;
    else if (b > 0.05) direction.current = 1;
    const move = direction.current * base * (delta / 1000) * (1 + Math.abs(b));
    x.set(wrap(-50, 0, x.get() + move));
  });

  const translate = useTransform(x, (v) => `${v}%`);
  const line = [...words, ...words];

  return (
    <div className={`overflow-hidden whitespace-nowrap py-4 md:py-6 ${className}`}>
      <motion.div style={{ x: translate, skewX: skew }} className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {line.map((w, i) => (
              <span key={i} className="flex items-center text-4xl md:text-7xl font-black uppercase tracking-tight">
                <span className="px-6 md:px-10">{w}</span>
                <span className="text-2xl md:text-4xl opacity-70">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  const t = useT(texts);
  return (
    <section aria-label={t.a.join(", ")} className="relative py-24 md:py-32 overflow-hidden">
      <div className="-rotate-3 scale-105">
        <Band words={t.a} base={-2.2} className="bg-blaa-500 text-white shadow-[0_30px_60px_-30px_rgba(4,84,231,0.8)]" />
      </div>
      <div className="mt-2 rotate-2 scale-105">
        <Band words={t.b} base={1.6} className="bg-white text-blaa-950" />
      </div>
    </section>
  );
}
