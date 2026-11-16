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

/* Right after the intro video, on white: three phones playing clips rise up from the bottom of
   the screen as you scroll down. All three are side by side from the start, so after a little
   scroll you can already see there are three; the middle one leads, the outer two follow just
   behind. With reduced motion they simply stand in place. */
export function Phones() {
  const t = useT(texts);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);

  // 0 when the section's top reaches the bottom of the screen, 1 when it reaches the top
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start end", "start start"] });
  const middleY = useTransform(p, [0, 0.85], ["45%", "0%"]);
  const sideY = useTransform(p, [0, 1], ["60%", "0%"]);
  const textOpacity = useTransform(p, [0.55, 0.95], [0, 1]);
  const ys = [sideY, middleY, sideY];

  // only download and play the clips when the section is close to the screen
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={section}
      aria-label={t.lines.join(" ")}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-5 pb-16 pt-24 md:px-10 md:pt-28"
    >
      <div className="flex items-end justify-center">
        {clips.map((clip, i) => {
          const side = i - 1; // -1 left, 0 middle, 1 right
          return (
            <motion.div
              key={clip.video}
              style={reduced ? undefined : { y: ys[i] }}
              className={`w-[min(32vw,26svh)] md:w-[min(17vw,27svh)] ${side === 0 ? "relative z-10" : "-mx-[3%] md:mx-[1.5vw]"}`}
            >
              <div style={{ transform: `rotate(${side * 6}deg) scale(${side === 0 ? 1 : 0.92})` }} className="origin-bottom">
                <Phone clip={clip} label={t.phones[i]} play={near} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        style={reduced ? undefined : { opacity: textOpacity }}
        className="mt-10 text-center font-serif text-[clamp(28px,4vw,56px)] leading-[1.05] md:mt-12 md:flex md:gap-[0.35em]"
      >
        {t.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </motion.p>
    </section>
  );
}
