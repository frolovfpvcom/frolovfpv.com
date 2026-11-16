"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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

/* Right after the intro video, on white, all tied to the scroll: first only the middle phone
   rises up from the bottom. Just as it has popped all the way up, the two others come out from
   behind it, make a small hop and land one on each side. The screen holds still (sticky) while
   they land, then the lines appear and the page carries on. With reduced motion the three phones
   simply stand side by side. */
export function Phones() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);

  // 0 when the section's top reaches the bottom of the screen, 1 when its end reaches the bottom
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start end", "end end"] });

  // the middle phone: from below the screen up to its place, growing a little on the way
  const midY = useTransform(p, [0, 0.42], ["80%", "0%"]);
  const midScale = useTransform(p, [0, 0.42], [0.82, 1]);
  // the side phones: out from behind it, up in a small hop, and down on their own side
  const hop = [0.36, 0.52, 0.66];
  const sideY = useTransform(p, hop, ["12%", "-16%", "0%"]);
  const sideScale = useTransform(p, hop, [0.7, 0.9, 0.92]);
  // opacity is worked out by hand: motion would otherwise hand a plain range over to the browser's
  // own scroll timeline, which measures it against the whole page and got it wrong here
  const sideOpacity = useTransform(p, (v) => ramp(v, 0.36, 0.42));
  const leftX = useTransform(p, [hop[0], hop[2]], ["0%", "-96%"]);
  const rightX = useTransform(p, [hop[0], hop[2]], ["0%", "96%"]);
  const leftRotate = useTransform(p, [hop[0], hop[2]], [0, -7]);
  const rightRotate = useTransform(p, [hop[0], hop[2]], [0, 7]);
  const textOpacity = useTransform(p, (v) => ramp(v, 0.7, 0.85));
  const textY = useTransform(p, [0.7, 0.85], [16, 0]);

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
    <section ref={section} aria-label={t.lines.join(" ")} className={reduced ? "relative" : "relative h-[230vh]"}>
      <div
        className={`${reduced ? "py-24" : "sticky top-0 h-[100svh]"} flex flex-col items-center justify-center overflow-hidden bg-white px-5 pt-16 md:px-10 md:pt-20`}
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
