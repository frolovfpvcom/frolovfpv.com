"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    lines: ["Ind ad døren.", "Gennem huset.", "Ud over taget."],
    phones: ["House tour", "Testkørsel", "Panoram"],
  },
  en: {
    lines: ["In through the door.", "Through the house.", "Out over the roof."],
    phones: ["House tour", "Test drive", "Panoram"],
  },
};

/* Upright copies of the clips, cut for a phone screen (540×960). */
const clips = [
  { video: "/clips/telefon-house-tour.mp4", poster: "/clips/telefon-house-tour.jpg" },
  { video: "/clips/telefon-testkorsel.mp4", poster: "/clips/telefon-testkorsel.jpg" },
  { video: "/clips/telefon-pande-ram.mp4", poster: "/clips/telefon-pande-ram.jpg" },
];

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

/** A phone drawn in CSS with a clip playing on its screen. */
function Phone({ clip, label, play }: { clip: (typeof clips)[number]; label: string; play: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (play) {
      v.preload = "auto";
      v.play().catch(() => {});
    } else v.pause();
  }, [play]);
  return (
    <div className="relative aspect-[9/19.5] w-full rounded-[18%/8.3%] bg-[#0d0e10] p-[4.5%] shadow-[0_40px_80px_-30px_rgba(15,20,35,0.55)] ring-1 ring-black/10">
      <div className="relative h-full w-full overflow-hidden rounded-[14%/6.5%] bg-neutral-800">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          poster={clip.poster}
          aria-label={label}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={clip.video} type="video/mp4" />
        </video>
        {/* the little pill at the top of the screen */}
        <span aria-hidden="true" className="absolute left-1/2 top-[2.5%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-[#0d0e10]" />
      </div>
    </div>
  );
}

/* Right after the intro video: a white, misty screen. While you scroll, one phone comes out of
   the fog, then two more spring out from behind it to the left and right, all three playing
   clips, and three short lines appear. The screen stays put (sticky) meanwhile, then the page
   carries on. With reduced motion the three phones are simply shown side by side. */
export function FogReveal() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [near, setNear] = useState(false);

  // 0 when the section's top is 60 % down the screen, 1 when its end reaches the bottom
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start 0.6", "end end"] });

  const phoneOpacity = useTransform(p, [0, 0.32], [0.1, 1]);
  const phoneBlur = useTransform(p, [0, 0.34], [26, 0]);
  const phoneScale = useTransform(p, [0, 0.36], [0.8, 1]);
  const phoneFilter = useMotionTemplate`blur(${phoneBlur}px)`;
  // the mist thins out but never quite goes, so the screen stays soft
  const fogOpacity = useTransform(p, [0, 0.6], [1, 0.35]);

  // once the first phone is sharp, the other two spring out; scrolling back tucks them in again
  useMotionValueEvent(p, "change", (v) => {
    if (v > 0.4) setOpen(true);
    else if (v < 0.3) setOpen(false);
  });

  // only download and play the clips when the section is close to the screen
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = reduced || open;
  const spring = { type: "spring", stiffness: 170, damping: 15, mass: 0.9 } as const;

  return (
    <section ref={section} aria-label={t.lines.join(" ")} className={reduced ? "relative" : "relative h-[260vh]"}>
      <div
        className={`${reduced ? "py-24" : "sticky top-0 h-[100svh]"} flex flex-col items-center justify-center overflow-hidden bg-white px-5 pt-16 md:px-10 md:pt-20`}
      >
        {/* the fog: big soft white and pale grey clouds drifting slowly */}
        <motion.div aria-hidden="true" style={reduced ? { opacity: 0.35 } : { opacity: fogOpacity }} className="pointer-events-none absolute inset-0 z-10">
          <div className="fog-cloud fog-a" />
          <div className="fog-cloud fog-b" />
          <div className="fog-cloud fog-c" />
        </motion.div>

        {/* the phones: sized by the screen height, and narrower on a phone screen */}
        <motion.div
          style={reduced ? undefined : { opacity: phoneOpacity, filter: phoneFilter, scale: phoneScale }}
          className="relative w-[min(36vw,30svh)] md:w-[min(24vw,31svh)]"
        >
          {[-1, 1].map((side) => (
            <motion.div
              key={side}
              initial={false}
              animate={
                shown
                  ? { x: `${side * 92}%`, rotate: side * 7, scale: 0.9, opacity: 1 }
                  : { x: "0%", rotate: 0, scale: 0.7, opacity: 0 }
              }
              transition={reduced ? { duration: 0 } : shown ? spring : { duration: 0.3, ease: "easeIn" }}
              className="absolute inset-0 origin-bottom"
            >
              <Phone clip={clips[side < 0 ? 1 : 2]} label={t.phones[side < 0 ? 1 : 2]} play={near && shown} />
            </motion.div>
          ))}
          {/* the first phone sits in front of the other two */}
          <div className="relative">
            <Phone clip={clips[0]} label={t.phones[0]} play={near} />
          </div>
        </motion.div>

        <p className="relative z-20 mt-8 text-center font-serif text-[clamp(28px,4vw,56px)] leading-[1.05] md:mt-10 md:flex md:gap-[0.35em]">
          {reduced
            ? t.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            : t.lines.map((line, i) => (
                <FogLine key={line} progress={p} from={0.5 + i * 0.1} to={0.62 + i * 0.1}>
                  {line}
                </FogLine>
              ))}
        </p>
      </div>
    </section>
  );
}
