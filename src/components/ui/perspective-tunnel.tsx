"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* A 3D tunnel of cards that flies towards the viewer while the page scrolls. Based on the
   "perspective tunnel hero" from 21st.dev, changed so it follows the normal page scroll (also
   with a finger on a phone) instead of catching the mouse wheel, and so the cards can be
   short looping clips. */

export type TunnelItem = { video: string; poster: string; title: string };

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

/** The mouse nudges the whole tunnel a little, like moving your head. Off on touch screens. */
function usePointer(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spring = { stiffness: 60, damping: 25, mass: 0.5 };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);
  return { x, y };
}

/** A muted clip that only downloads and plays while the tunnel is close to the screen. */
function CardClip({ item, play }: { item: TunnelItem; play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) {
      v.preload = "auto";
      v.play().catch(() => {});
    } else v.pause();
  }, [play]);
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={item.poster}
      aria-label={item.title}
      className="h-full w-full object-cover"
    >
      <source src={item.video} type="video/mp4" />
    </video>
  );
}

function TunnelCard({
  card,
  progress,
  pointer,
  total,
  stage,
  play,
}: {
  card: CardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: Stage;
  play: boolean;
}) {
  // each card travels over a slice of the scroll, the slices overlap
  const span = 0.55;
  const start = (card.index / total) * (1 - span);
  const local = useTransform(progress, [start, start + span], [0, 1]);
  const z = useTransform(local, [0, 1], stage.isMobile ? [-1200, 350] : [-1700, 500]);
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const width = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));
  const baseX = card.cos * stage.width * card.radiusX;
  const baseY = card.sin * stage.height * card.radiusY;
  const pan = stage.isMobile ? 0 : 45;

  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => {
    const x = baseX - px * pan;
    const y = baseY - py * pan;
    return `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${currZ}px) rotateZ(${card.rotateZ}deg)`;
  });

  return (
    <motion.div
      style={{ width, transform, opacity, zIndex: card.index + 1 }}
      className="absolute left-1/2 top-1/2 aspect-[4/5] select-none will-change-transform"
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0f2350] shadow-2xl shadow-black/60 ring-1 ring-white/15">
        <CardClip item={card.item} play={play} />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#06122e]/85 via-transparent to-transparent p-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/95 sm:text-xs">
            {card.item.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function PerspectiveTunnel({
  items,
  children,
  end,
  label,
}: {
  items: TunnelItem[];
  /** The text in the middle that the cards fly past. */
  children: ReactNode;
  /** What shows up in the middle once the last card has flown by. */
  end?: ReactNode;
  label: string;
}) {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [stage, setStage] = useState<Stage>({ width: 1440, height: 900, isMobile: false });
  const cards = layout(items);

  useEffect(() => {
    const update = () =>
      setStage({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 0 when the section's top reaches the top of the screen, 1 when its end reaches the bottom;
  // the screen holds still (sticky) in between while the cards fly
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0001 });
  const pointer = usePointer(!reduced && !stage.isMobile);

  const titleScale = useTransform(progress, [0, 0.5, 1], [0.8, 1, 1.04]);
  const titleOpacity = useTransform(progress, [0, 0.08], [0.65, 1]);
  const endOpacity = useTransform(progress, [0.72, 0.88], [0, 1]);
  const endY = useTransform(progress, [0.72, 0.88], [18, 0]);
  const hintOpacity = useTransform(progress, [0, 0.1], [1, 0]);

  if (reduced) {
    return (
      <section aria-label={label} className="bg-[#06122e] px-5 py-24 text-white md:px-10">
        <div className="mx-auto max-w-[1100px] text-center">{children}</div>
        <div className="mx-auto mt-12 grid max-w-[1100px] grid-cols-3 gap-3 md:grid-cols-5">
          {items.slice(0, 5).map((item) => (
            <div key={item.video} className="aspect-[4/5] overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.poster} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
        {end && <div className="mx-auto mt-12 max-w-[1100px] text-center">{end}</div>}
      </section>
    );
  }

  return (
    <section ref={section} aria-label={label} className="relative h-[280vh] md:h-[320vh]">
      <div
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#06122e] text-white"
        style={{ perspective: stage.isMobile ? "900px" : "1200px", transformStyle: "preserve-3d" }}
      >
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

        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="relative z-0 flex max-w-2xl flex-col items-center px-6 text-center"
        >
          {children}
          {end && (
            <motion.div style={{ opacity: endOpacity, y: endY }} className="mt-8">
              {end}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-28 z-20 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-sky-200/80 md:bottom-10"
        >
          <span>Scroll</span>
          <span className="h-6 w-px bg-gradient-to-b from-sky-300 to-transparent" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cards.map((card) => (
            <TunnelCard
              key={card.item.video}
              card={card}
              progress={progress}
              pointer={pointer}
              total={cards.length}
              stage={stage}
              play={near}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
