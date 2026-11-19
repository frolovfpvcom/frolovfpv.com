"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    lines: ["Ind ad døren.", "Gennem huset.", "Ud over taget."],
    phones: ["Bilforhandler med FPV-video", "Panoram", "Testkørsel"],
    dealer: {
      tag: "Nyhed",
      title: "Den nye SUV er landet",
      sub: "Se den i fart, før du ser den hos os.",
      price: "Fra 389.900 kr.",
      cta: "Book prøvetur",
      menu: ["Nye biler", "Brugte", "Værksted"],
      perks: ["Hybrid", "Firehjulstræk", "7 års garanti"],
      more: "Flere biler på lager",
    },
  },
  en: {
    lines: ["In through the door.", "Through the house.", "Out over the roof."],
    phones: ["Car dealer with an FPV video", "Panoram", "Test drive"],
    dealer: {
      tag: "New",
      title: "The new SUV has landed",
      sub: "See it in motion before you see it with us.",
      price: "From 389,900 kr.",
      cta: "Book a test drive",
      menu: ["New cars", "Used", "Service"],
      perks: ["Hybrid", "All-wheel drive", "7-year warranty"],
      more: "More cars in stock",
    },
  },
};

type Clip = { video: string; poster: string };
type Screen = "dealer" | "reel";

/* Left, middle, right. The left phone shows a made-up car dealer's website with the clip in it;
   the middle and right ones play an upright clip full screen. */
const phones: { clip: Clip; screen: Screen }[] = [
  { clip: { video: "/clips/telefon-roed-bil.mp4", poster: "/clips/telefon-roed-bil.jpg" }, screen: "dealer" },
  { clip: { video: "/clips/telefon-pande-ram.mp4", poster: "/clips/telefon-pande-ram.jpg" }, screen: "reel" },
  { clip: { video: "/clips/telefon-testkorsel.mp4", poster: "/clips/telefon-testkorsel.jpg" }, screen: "reel" },
];

/** 0 before `from`, 1 after `to`, a straight line in between. */
const ramp = (v: number, from: number, to: number) => Math.min(1, Math.max(0, (v - from) / (to - from)));

/** 0 → 1, but it shoots a little past 1 near the end and settles back: the "pop" of a bounce. */
const backOut = (t: number, overshoot = 2.2) => {
  const u = t - 1;
  return 1 + (overshoot + 1) * u * u * u + overshoot * u * u;
};

/* Springs that follow the scroll but overshoot and wobble a little before they settle, so the
   phones feel bouncy, also when the scrolling stops suddenly. */
const bounce = { stiffness: 210, damping: 13, mass: 0.9 };

/** A muted, looping clip that only plays while `play` is on. */
function Clip({ clip, label, play, className }: { clip: Clip; label: string; play: boolean; className: string }) {
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
    <video ref={video} muted loop playsInline preload="none" poster={clip.poster} aria-label={label} className={className}>
      <source src={clip.video} type="video/mp4" />
    </video>
  );
}

/* Everything inside a screen is sized in cqw (1 % of the screen's width), so the little website
   looks the same whether the phone is 110 or 280 pixels wide. */

/** The clock and the signal/battery marks at the very top of the screen. */
function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={`flex h-[15cqw] items-center justify-between px-[8cqw] pt-[1cqw] text-[3.6cqw] font-semibold ${dark ? "text-white" : "text-neutral-900"}`}>
      <span>9:41</span>
      <span className="flex items-center gap-[1.4cqw]" aria-hidden="true">
        <span className="flex items-end gap-[0.6cqw]">
          {[1.4, 2, 2.6, 3.2].map((h) => (
            <span key={h} className="w-[0.9cqw] rounded-[0.3cqw] bg-current" style={{ height: `${h}cqw` }} />
          ))}
        </span>
        <span className="relative h-[3cqw] w-[6cqw] rounded-[0.9cqw] border-[0.4cqw] border-current">
          <span className="absolute inset-[0.4cqw] right-[1.4cqw] rounded-[0.3cqw] bg-current" />
        </span>
      </span>
    </div>
  );
}

/** The browser's address field. */
function UrlBar({ host }: { host: string }) {
  return (
    <div className="mx-[4cqw] flex h-[8cqw] items-center justify-center gap-[1.4cqw] rounded-[2.4cqw] bg-neutral-100 text-[3.4cqw] text-neutral-700">
      <svg viewBox="0 0 12 12" className="h-[2.8cqw] w-[2.8cqw]" aria-hidden="true">
        <rect x="2" y="5.2" width="8" height="5.6" rx="1.2" fill="currentColor" />
        <path d="M3.8 5.4V4a2.2 2.2 0 0 1 4.4 0v1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      {host}
    </div>
  );
}

/** A made-up car dealer's page with the red car clip as its big picture. */
function DealerScreen({ clip, label, play }: { clip: Clip; label: string; play: boolean }) {
  const t = useT(texts).dealer;
  return (
    <div className="flex h-full flex-col bg-white text-[#14213d]">
      <StatusBar />
      <UrlBar host="motorlinjen.dk" />
      <div className="flex items-center justify-between px-[5cqw] pb-[2.5cqw] pt-[3.5cqw]">
        <span className="text-[5.2cqw] font-extrabold tracking-tight">
          MOTOR<span className="text-[#c8102e]">LINJEN</span>
        </span>
        <span className="flex flex-col gap-[0.9cqw]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[0.6cqw] w-[4.4cqw] rounded-full bg-current" />
          ))}
        </span>
      </div>
      <div className="flex gap-[3.5cqw] px-[5cqw] pb-[3cqw] text-[3.2cqw] text-[#14213d]/60">
        {t.menu.map((m, i) => (
          <span key={m} className={i === 0 ? "font-semibold text-[#14213d]" : ""}>
            {m}
          </span>
        ))}
      </div>
      <div className="relative aspect-[4/3] w-full bg-neutral-800">
        <Clip clip={clip} label={label} play={play} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute left-[4cqw] top-[4cqw] rounded-[1cqw] bg-[#c8102e] px-[2.2cqw] py-[0.8cqw] text-[3cqw] font-bold uppercase tracking-wide text-white">
          {t.tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-[5cqw] pt-[4.5cqw]">
        <p className="text-[6.4cqw] font-extrabold leading-[1.1]">{t.title}</p>
        <p className="mt-[1.8cqw] text-[3.6cqw] leading-snug text-[#14213d]/65">{t.sub}</p>
        <p className="mt-[3.5cqw] text-[4.6cqw] font-bold">{t.price}</p>
        <span className="mt-[4cqw] flex h-[10cqw] items-center justify-center rounded-[2cqw] bg-[#c8102e] text-[3.8cqw] font-semibold text-white">
          {t.cta}
        </span>
        <div className="mt-[4cqw] flex flex-wrap gap-[1.6cqw]">
          {t.perks.map((perk) => (
            <span key={perk} className="rounded-full border-[0.4cqw] border-[#14213d]/15 px-[2.2cqw] py-[0.8cqw] text-[2.9cqw]">
              ✓ {perk}
            </span>
          ))}
        </div>
        <p className="mt-[5cqw] text-[3.6cqw] font-bold">{t.more}</p>
        <div className="mt-[2cqw] grid grid-cols-3 gap-[2cqw]">
          {["38% 50%", "62% 50%", "50% 30%"].map((pos) => (
            <span
              key={pos}
              className="aspect-[4/3] rounded-[1.6cqw] bg-neutral-300 bg-cover"
              style={{ backgroundImage: `url(${clip.poster})`, backgroundPosition: pos, backgroundSize: "220%" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** A phone drawn in CSS, showing one of the screens above. */
function Phone({ phone, label, play }: { phone: (typeof phones)[number]; label: string; play: boolean }) {
  return (
    <div className="relative aspect-[9/19.5] w-full rounded-[18%/8.3%] bg-[#0d0e10] p-[4.5%] shadow-[0_40px_80px_-30px_rgba(15,20,35,0.55)] ring-1 ring-black/10">
      <div className="relative h-full w-full overflow-hidden rounded-[14%/6.5%] bg-neutral-800 [container-type:inline-size]">
        {phone.screen === "dealer" ? (
          <DealerScreen clip={phone.clip} label={label} play={play} />
        ) : (
          <Clip clip={phone.clip} label={label} play={play} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {/* the little pill at the top of the screen */}
        <span aria-hidden="true" className="absolute left-1/2 top-[2.5%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-[#0d0e10]" />
      </div>
    </div>
  );
}

/* Right after the intro video, on white: first only the middle phone pops up from the bottom,
   shooting a little past its place and bouncing back. Just as it is all the way up, the two
   others hop out from behind it on a half circle (up first, then out, then down) and land one
   on each side with a little bounce; then the lines appear.
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

  // the scroll steps go through springs, so they overshoot and wobble before they settle
  const riseSpring = useSpring(rise, bounce);
  const hopSpring = useSpring(hop, bounce);
  // on a phone screen the side phones land a little closer, so they stay on the screen
  const spread = phone ? 76 : 96; // % of the phone's width

  // the middle phone: from below up to its place, growing on the way, popping a little past it
  const midY = useTransform(riseSpring, (r) => `${80 * (1 - backOut(r))}%`);
  const midScale = useTransform(riseSpring, (r) => 0.8 + 0.2 * backOut(r));
  // the side phones hop from behind the middle one to their own side: up first, out across the
  // top, down at the end, landing a little too far and bouncing back into place
  const sideOut = (h: number) => backOut(Math.min(1, Math.max(0, h)), 1.8);
  const lift = (h: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, h)));
  const sideY = useTransform(hopSpring, (h) => `${-(phone ? 16 : 20) * lift(h)}%`);
  const sideScale = useTransform(hopSpring, (h) => 0.7 + 0.22 * sideOut(h));
  const sideOpacity = useTransform(hopSpring, (h) => ramp(h, 0, 0.12));
  const leftX = useTransform(hopSpring, (h) => `${-spread * sideOut(h)}%`);
  const rightX = useTransform(hopSpring, (h) => `${spread * sideOut(h)}%`);
  const leftRotate = useTransform(hopSpring, (h) => -7 * sideOut(h));
  const rightRotate = useTransform(hopSpring, (h) => 7 * sideOut(h));
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
    { phone: phones[0], label: t.phones[0], x: leftX, rotate: leftRotate, still: { x: `-${spread}%`, rotate: -7, scale: 0.92 } },
    { phone: phones[2], label: t.phones[2], x: rightX, rotate: rightRotate, still: { x: `${spread}%`, rotate: 7, scale: 0.92 } },
  ];

  return (
    <section ref={section} aria-label={t.lines.join(" ")} className={reduced ? "relative" : "relative h-[170vh] md:h-[230vh]"}>
      <div
        className={`${reduced ? "py-24" : "sticky top-0 h-[100svh] justify-start pt-[13svh] md:justify-center md:pt-20"} flex flex-col items-center overflow-hidden bg-white px-5 md:px-10`}
      >
        {/* the phones are sized by the screen height; on a phone screen they sit higher up
            and a little bigger, so the middle one fills the screen right after the intro */}
        <div className="relative w-[min(36vw,34svh)] md:w-[min(17vw,28svh)]">
          {sides.map((side) => (
            <motion.div
              key={side.phone.clip.video}
              style={
                reduced
                  ? side.still
                  : { x: side.x, y: sideY, rotate: side.rotate, scale: sideScale, opacity: sideOpacity }
              }
              className="absolute inset-0 origin-bottom"
            >
              <Phone phone={side.phone} label={side.label} play={near} />
            </motion.div>
          ))}
          {/* the middle phone sits in front of the other two */}
          <motion.div style={reduced ? undefined : { y: midY, scale: midScale }} className="relative origin-bottom">
            <Phone phone={phones[1]} label={t.phones[1]} play={near} />
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
