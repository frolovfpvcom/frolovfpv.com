"use client";

import { useEffect, useState } from "react";
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

/** The cards fly for the whole 2.5 s; over the last 0.4 s the tunnel fades into the video. */
const TOTAL = 2.5;
const FADE = 0.4;

/* The first thing on the front page: for 2.5 s a dark blue tunnel of Peter's clips flies at you
   past "Er du klar til at se, hvad FPV kan?", then it fades away and the real intro video plays
   from the start. It plays on its own; nobody has to scroll. Skipped with reduced motion. */
export function FpvIntro({ onDone }: { onDone: () => void }) {
  const t = useT(texts);
  // starts a little in, so the first cards are already on their way when the page opens
  const progress = useMotionValue(0.08);
  const opacity = useMotionValue(1);
  const [gone, setGone] = useState(false);
  const items: TunnelItem[] = images.map((image, i) => ({ image, title: t.titles[i] }));

  useEffect(() => {
    // with reduced motion the tunnel is skipped and the video starts at once
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // an even speed, so there is always a card flying by
    const fly = animate(progress, 1, { duration: still ? 0 : TOTAL, ease: "linear" });
    const fade = animate(opacity, 0, { duration: still ? 0 : FADE, delay: still ? 0 : TOTAL - FADE, ease: "easeOut" });
    fade.then(() => {
      setGone(true);
      onDone();
    });
    return () => {
      fly.stop();
      fade.stop();
    };
    // runs once, when the front page opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 z-10" aria-hidden="true">
      <PerspectiveTunnel items={items} progress={progress}>
        <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.4em] text-sky-300">{t.kicker}</p>
        <p className="font-serif text-[clamp(44px,8vw,104px)] leading-[0.95]">{t.title}</p>
      </PerspectiveTunnel>
    </motion.div>
  );
}
