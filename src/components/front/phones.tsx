"use client";

import { useEffect, useRef, useState } from "react";
import {
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
   It all follows the scroll, and the screen holds still (sticky), all white, while the phones
   land. With reduced motion the three phones simply stand side by side. */

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

  // 0 when the section's top reaches the bottom of the screen, 1 when its end does. The section
  // is shorter on a phone, so less scrolling plays it. The middle phone is all the way up just as
  // the section's top reaches the top of the screen, so the side phones hop on a white screen.
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start end", "end end"] });
  useMotionValueEvent(p, "change", (v) => {
    const top = phone ? 1 / 1.7 : 1 / 2.3; // where the section's top meets the top of the screen
    rise.set(ramp(v, 0, top));
    hop.set(ramp(v, top - 0.03, phone ? 0.84 : 0.68));
    words.set(ramp(v, phone ? 0.84 : 0.7, phone ? 0.95 : 0.85));
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    <section ref={section} aria-label={t.lines.join(" ")} className={reduced ? "relative" : "relative h-[170vh] md:h-[230vh]"}>
      <div
        className={`${reduced ? "py-24" : "sticky top-0 h-[100svh] pt-16 md:pt-20"} flex flex-col items-center justify-center overflow-hidden bg-white px-5 md:px-10`}
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
