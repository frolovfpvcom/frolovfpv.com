"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/* A 3D tunnel of cards that flies towards the viewer as `progress` goes from 0 to 1. Based on
   the "perspective tunnel hero" from 21st.dev; here the caller drives `progress` (on the front
   page it plays by itself as a short intro), and the cards are stills from Peter's clips. */

export type TunnelItem = { image: string; title: string };

type Stage = { width: number; height: number; isMobile: boolean };

type CardData = {
  item: TunnelItem;
  cos: number;
  sin: number;
  radiusX: number;
  radiusY: number;
  rotateZ: number;
  index: number;
};

/** Spread the cards around the centre on the golden angle, so they never line up. */
function layout(items: TunnelItem[]): CardData[] {
  return items.map((item, i) => {
    const angle = i * 137.5 * (Math.PI / 180);
    return {
      item,
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      radiusX: 0.28 + (i % 3) * 0.08,
      radiusY: 0.26 + (i % 2) * 0.09,
      rotateZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
      index: i,
    };
  });
}

function TunnelCard({
  card,
  progress,
  total,
  stage,
}: {
  card: CardData;
  progress: MotionValue<number>;
  total: number;
  stage: Stage;
}) {
  // each card travels over a slice of the progress, the slices overlap
  const span = 0.55;
  const start = (card.index / total) * (1 - span);
  const local = useTransform(progress, [start, start + span], [0, 1]);
  const z = useTransform(local, [0, 1], stage.isMobile ? [-1200, 350] : [-1700, 500]);
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const width = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));
  const x = card.cos * stage.width * card.radiusX;
  const y = card.sin * stage.height * card.radiusY;
  const transform = useTransform(
    z,
    (currZ) => `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${currZ}px) rotateZ(${card.rotateZ}deg)`,
  );

  return (
    <motion.div
      style={{ width, transform, opacity, zIndex: card.index + 1 }}
      className="absolute left-1/2 top-1/2 aspect-[4/5] select-none will-change-transform"
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0f2350] shadow-2xl shadow-black/60 ring-1 ring-white/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.item.image} alt="" draggable={false} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#06122e]/85 via-transparent to-transparent p-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/95 sm:text-xs">
            {card.item.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** Fills its parent: a dark blue stage with the text in the middle and the cards flying past. */
export function PerspectiveTunnel({
  items,
  progress,
  children,
}: {
  items: TunnelItem[];
  progress: MotionValue<number>;
  /** The text in the middle that the cards fly past. */
  children: ReactNode;
}) {
  const [stage, setStage] = useState<Stage>({ width: 1440, height: 900, isMobile: false });
  const cards = layout(items);

  useEffect(() => {
    const update = () =>
      setStage({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const titleScale = useTransform(progress, [0, 1], [0.86, 1.12]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#06122e] text-white">
      {/* a blue glow in the middle, a fine dot grid and two rings for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35)_0%,rgba(29,78,216,0.12)_40%,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(147,197,253,0.22)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-sky-300/20" />
      <div aria-hidden="true" className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/10" />

      {/* the cards fly in their own 3D space, behind the text */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ perspective: stage.isMobile ? "900px" : "1200px", transformStyle: "preserve-3d" }}
      >
        {cards.map((card) => (
          <TunnelCard key={card.item.image} card={card} progress={progress} total={cards.length} stage={stage} />
        ))}
      </div>

      {/* the text sits on top, so the cards never cover it */}
      <motion.div
        style={{ scale: titleScale }}
        className="relative z-20 flex max-w-3xl flex-col items-center px-6 text-center [text-shadow:0_2px_24px_rgba(6,18,46,0.9)]"
      >
        {children}
      </motion.div>
    </div>
  );
}
