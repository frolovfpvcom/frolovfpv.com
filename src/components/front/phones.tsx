"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    lines: ["Ind ad døren.", "Gennem huset.", "Ud over taget."],
    phones: ["Testkørsel", "House tour", "Panoram"],
  },
  en: {
    lines: ["In through the door.", "Through the house.", "Out over the roof."],
    phones: ["Test drive", "House tour", "Panoram"],
  },
};

/* Upright copies of the clips, cut for a phone screen (540×960). Left, middle, right. */
const clips = [
  { video: "/clips/telefon-testkorsel.mp4", poster: "/clips/telefon-testkorsel.jpg" },
  { video: "/clips/telefon-house-tour.mp4", poster: "/clips/telefon-house-tour.jpg" },
  { video: "/clips/telefon-pande-ram.mp4", poster: "/clips/telefon-pande-ram.jpg" },
];

/** 0 before `from`, 1 after `to`, a straight line in between. */
const ramp = (v: number, from: number, to: number) => Math.min(1, Math.max(0, (v - from) / (to - from)));

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

/* Right after the intro video, on white: first only the middle phone rises up from the bottom.
   Just as it has popped all the way up, the two others come out from behind it and travel a
   half circle (up first, then out, then down) to land one on each side; then the lines appear.

   On a computer it is all tied to the scroll and the screen holds still (sticky) meanwhile.
   On a phone it plays by itself as soon as you have scrolled a little, so one swipe is enough
   to see the whole thing. With reduced motion the three phones simply stand side by side. */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Phones() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [phone, setPhone] = useState(false);

  // three steps, each 0 → 1: the middle phone rising, the side phones' half circle, the lines
  const rise = useMotionValue(0);
  const hop = useMotionValue(0);
  const words = useMotionValue(0);

  // computer: 0 when the section's top reaches the bottom of the screen, 1 when its end does
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start end", "end end"] });
  useMotionValueEvent(p, "change", (v) => {
    if (phone) return;
    rise.set(ramp(v, 0, 0.42));
    hop.set(ramp(v, 0.36, 0.66));
    words.set(ramp(v, 0.7, 0.85));
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // phone: play once the section is a little way onto the screen, rewind when it is gone below
  useEffect(() => {
    if (!phone || reduced) return;
    let played = false;
    const runs: { stop: () => void }[] = [];
    const check = () => {
      const top = section.current?.getBoundingClientRect().top ?? Infinity;
      const h = window.innerHeight;
      if (!played && top < h * 0.85) {
        played = true;
        runs.push(
          animate(rise, 1, { duration: 0.75, ease: EASE_OUT }),
          animate(hop, 1, { duration: 0.95, delay: 0.5, ease: "easeInOut" }),
          animate(words, 1, { duration: 0.5, delay: 1.25, ease: "easeOut" }),
        );
      } else if (played && top > h) {
        played = false;
        runs.splice(0).forEach((r) => r.stop());
        rise.set(0);
        hop.set(0);
        words.set(0);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      runs.forEach((r) => r.stop());
    };
  }, [phone, reduced, rise, hop, words]);

  // the middle phone: from below up to its place, growing a little on the way
  const midY = useTransform(rise, (r) => `${80 * (1 - r)}%`);
  const midScale = useTransform(rise, (r) => 0.82 + 0.18 * r);
  // the side phones on a half circle from behind the middle one to their own side:
  // straight up at first, out across the top, and straight down at the end
  const arcX = (h: number) => 48 * (1 - Math.cos(Math.PI * h)); // % of the phone's width, 0 → 96
  const sideY = useTransform(hop, (h) => `${-20 * Math.sin(Math.PI * h)}%`);
  const sideScale = useTransform(hop, (h) => 0.7 + 0.22 * h);
  const sideOpacity = useTransform(hop, (h) => ramp(h, 0, 0.12));
  const leftX = useTransform(hop, (h) => `${-arcX(h)}%`);
  const rightX = useTransform(hop, (h) => `${arcX(h)}%`);
  const leftRotate = useTransform(hop, (h) => -7 * h);
  const rightRotate = useTransform(hop, (h) => 7 * h);
  const textOpacity = useTransform(words, (w) => w);
  const textY = useTransform(words, (w) => 16 * (1 - w));

  // only download and play the clips when the section is close to the screen
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sides = [
    { clip: clips[0], label: t.phones[0], x: leftX, rotate: leftRotate, still: { x: "-96%", rotate: -7, scale: 0.92 } },
    { clip: clips[2], label: t.phones[2], x: rightX, rotate: rightRotate, still: { x: "96%", rotate: 7, scale: 0.92 } },
  ];

  return (
    <section ref={section} aria-label={t.lines.join(" ")} className={reduced ? "relative" : "relative md:h-[230vh]"}>
      <div
        className={`${reduced ? "py-24" : "py-14 md:sticky md:top-0 md:h-[100svh] md:py-0 md:pt-20"} flex flex-col items-center justify-center overflow-hidden bg-white px-5 md:px-10`}
      >
        {/* the phones are sized by the screen height, and narrower on a phone screen */}
        <div className="relative w-[min(30vw,28svh)] md:w-[min(17vw,28svh)]">
          {sides.map((side) => (
            <motion.div
              key={side.clip.video}
              style={
                reduced
                  ? side.still
                  : { x: side.x, y: sideY, rotate: side.rotate, scale: sideScale, opacity: sideOpacity }
              }
              className="absolute inset-0 origin-bottom"
            >
              <Phone clip={side.clip} label={side.label} play={near} />
            </motion.div>
          ))}
          {/* the middle phone sits in front of the other two */}
          <motion.div style={reduced ? undefined : { y: midY, scale: midScale }} className="relative origin-bottom">
            <Phone clip={clips[1]} label={t.phones[1]} play={near} />
          </motion.div>
        </div>

        <motion.p
          style={reduced ? undefined : { opacity: textOpacity, y: textY }}
          className="relative mt-10 text-center font-serif text-[clamp(28px,4vw,56px)] leading-[1.05] md:mt-12 md:flex md:gap-[0.35em]"
        >
          {t.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </motion.p>
      </div>
    </section>
  );
}
