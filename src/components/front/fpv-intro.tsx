"use client";

import { useEffect, useState } from "react";
import { preload } from "react-dom";
import { animate, motion, useMotionValue } from "motion/react";
import { PerspectiveTunnel, type TunnelItem } from "@/components/ui/perspective-tunnel";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    kicker: "Flyv med",
    title: "Er du klar til at se, hvad FPV kan?",
    titles: [
      "Gennem loftet",
      "Ud ad vinduet",
      "Indendørs",
      "Blomstermarken",
      "Over trætoppene",
      "Testkørsel",
      "Bil i fart",
      "Følger bilen",
      "Tæt på bilen",
    ],
  },
  en: {
    kicker: "Fly along",
    title: "Ready to see what FPV can do?",
    titles: [
      "Through the attic",
      "Out the window",
      "Indoors",
      "Flower field",
      "Over the treetops",
      "Test drive",
      "Car at speed",
      "Chasing the car",
      "Up close",
    ],
  },
};

/** Stills from Peter's own FPV footage, cut to 4:5 for the cards. */
const images = Array.from({ length: 9 }, (_, i) => `/tunnel/klip-${i + 1}.jpg`);

/** The cards fly for the whole 4 s; over the last 0.5 s the tunnel fades into the video. */
const TOTAL = 4;
const FADE = 0.5;
/** Never wait longer than this for the pictures before the cards start flying. */
const MAX_WAIT = 1500;

/* The first thing on the front page: for 4 s a dark blue tunnel of Peter's clips flies at you
   past "Er du klar til at se, hvad FPV kan?", then it fades away and the real intro video plays
   from the start. It plays on its own; nobody has to scroll. Skipped with reduced motion. */
/** `onDone` is called as the tunnel starts fading out, which is when the video should start. */
export function FpvIntro({ onDone }: { onDone: () => void }) {
  const t = useT(texts);
  // starts a little in, so the first cards are already on their way when the page opens
  const progress = useMotionValue(0.08);
  const opacity = useMotionValue(1);
  const [gone, setGone] = useState(false);
  const items: TunnelItem[] = images.map((image, i) => ({ image, title: t.titles[i] }));
  // ask for the pictures in the page's <head>, so they load together with the page
  images.forEach((src) => preload(src, { as: "image", fetchPriority: "high" }));

  useEffect(() => {
    // with reduced motion the tunnel is skipped and the video starts at once
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let fly: ReturnType<typeof animate> | undefined;
    let fade: ReturnType<typeof animate> | undefined;
    let reveal: number | undefined;
    const start = () => {
      if (cancelled || fly) return;
      // an even speed, so there is always a card flying by
      fly = animate(progress, 1, { duration: still ? 0 : TOTAL, ease: "linear" });
      // as the fade begins, the video starts from the beginning underneath, so it never jumps
      reveal = window.setTimeout(onDone, still ? 0 : (TOTAL - FADE) * 1000);
      fade = animate(opacity, 0, { duration: still ? 0 : FADE, delay: still ? 0 : TOTAL - FADE, ease: "easeOut" });
      fade.then(() => setGone(true));
    };
    // wait until every picture is ready, so no card flies by empty (but never more than 1.5 s)
    const ready = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => {});
    });
    Promise.all(ready).then(start);
    const timer = window.setTimeout(start, still ? 0 : MAX_WAIT);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(reveal);
      fly?.stop();
      fade?.stop();
    };
    // runs once, when the front page opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 z-10" aria-hidden="true">
      <PerspectiveTunnel items={items} progress={progress}>
        <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.4em] text-sky-300">{t.kicker}</p>
        <p className="font-serif text-[clamp(44px,8vw,104px)] leading-[0.95]">{t.title}</p>
      </PerspectiveTunnel>
    </motion.div>
  );
}
