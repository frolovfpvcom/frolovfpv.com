"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang, useT, type Lang } from "@/lib/lang";

/* ------------------------------------------------------------------ data -- */

type FrameStyle = "white" | "oak" | "black";

type Project = {
  /** Thumbnail. Leave out for a placeholder that shows a soft colour field. */
  image?: string;
  /** Clip that plays in the frame on the "Video" tab. */
  video?: string;
  /** Width / height of the frame. */
  aspect: number;
  frame: FrameStyle;
  /** Colours for the placeholder field. */
  tint?: [string, string];
  title: Record<Lang, string>;
  category: Record<Lang, string>;
  meta: Record<Lang, string>;
  description: Record<Lang, string>;
  tags: Record<Lang, string[]>;
};

// Placeholder projects. Swap in real titles, texts and thumbnails as they come.
const projects: Project[] = [
  {
    image: "/projekter/peugeot-1.jpg",
    video: "/clips/peugeot/klip-1.mp4",
    aspect: 4 / 3,
    frame: "white",
    title: { da: "Peugeot shenanigans", en: "Peugeot shenanigans" },
    category: { da: "Bil", en: "Car" },
    meta: { da: "Reklame · 4K", en: "Commercial · 4K" },
    description: {
      da: "FPV-drone tæt langs bilen på en grusplads. Lave, hurtige linjer, der får en stillestående bil til at føles levende.",
      en: "An FPV drone tight along the car on a gravel lot. Low, fast lines that make a parked car feel alive.",
    },
    tags: { da: ["4K", "FPV", "Reklame"], en: ["4K", "FPV", "Commercial"] },
  },
  {
    image: "/projekter/panoram.jpg",
    video: "/clips/panoram.mp4",
    aspect: 16 / 10,
    frame: "oak",
    title: { da: "Panoram", en: "Panoram" },
    category: { da: "Natur", en: "Nature" },
    meta: { da: "Natur · 4K · 0:33", en: "Nature · 4K · 0:33" },
    description: {
      da: "En rolig flyvning hen over marken i aftenlys, hvor landskabet folder sig ud foran kameraet.",
      en: "A calm flight over the field in evening light, with the landscape unfolding in front of the camera.",
    },
    tags: { da: ["4K", "Natur", "Aftenlys"], en: ["4K", "Nature", "Evening light"] },
  },
  {
    image: "/projekter/peugeot-2.jpg",
    video: "/clips/peugeot/klip-2.mp4",
    aspect: 1,
    frame: "black",
    title: { da: "Rundt om bilen", en: "Around the car" },
    category: { da: "Bil", en: "Car" },
    meta: { da: "Reklame · 4K", en: "Commercial · 4K" },
    description: {
      da: "Et langt, glidende kredsløb om bilen, der viser den fra alle sider i ét skud.",
      en: "One long, gliding orbit around the car that shows it from every side in a single shot.",
    },
    tags: { da: ["4K", "FPV", "Ét skud"], en: ["4K", "FPV", "One take"] },
  },
  {
    aspect: 4 / 5,
    frame: "white",
    tint: ["#1f3a2b", "#8fbf9a"],
    title: { da: "Gennem parken", en: "Through the park" },
    category: { da: "Kommer snart", en: "Coming soon" },
    meta: { da: "Natur · kommer snart", en: "Nature · coming soon" },
    description: {
      da: "Pladsholder. Her kommer et projekt med en flyvning mellem træerne.",
      en: "Placeholder. A project with a flight between the trees is coming here.",
    },
    tags: { da: ["Natur"], en: ["Nature"] },
  },
  {
    image: "/projekter/peugeot-3.jpg",
    video: "/clips/peugeot/klip-3.mp4",
    aspect: 4 / 5,
    frame: "oak",
    title: { da: "Tæt på", en: "Up close" },
    category: { da: "Bil", en: "Car" },
    meta: { da: "Reklame · 4K", en: "Commercial · 4K" },
    description: {
      da: "Dronen dykker ind over bilen og trækker væk igen. Bygget til at åbne eller lukke en film.",
      en: "The drone dives in over the car and pulls away again. Made to open or close a film.",
    },
    tags: { da: ["4K", "FPV", "Reklame"], en: ["4K", "FPV", "Commercial"] },
  },
  {
    aspect: 16 / 10,
    frame: "black",
    tint: ["#101a33", "#6b86c9"],
    title: { da: "Nattelys", en: "Night lights" },
    category: { da: "Kommer snart", en: "Coming soon" },
    meta: { da: "By · kommer snart", en: "City · coming soon" },
    description: {
      da: "Pladsholder. Her kommer et projekt med byen om natten.",
      en: "Placeholder. A project with the city at night is coming here.",
    },
    tags: { da: ["By", "Nat"], en: ["City", "Night"] },
  },
  {
    aspect: 4 / 5,
    frame: "white",
    tint: ["#2a3a44", "#a9c4cf"],
    title: { da: "Klippekant", en: "Cliff edge" },
    category: { da: "Kommer snart", en: "Coming soon" },
    meta: { da: "Hav · kommer snart", en: "Sea · coming soon" },
    description: {
      da: "Pladsholder. Her kommer et projekt langs kysten.",
      en: "Placeholder. A project along the coast is coming here.",
    },
    tags: { da: ["Hav"], en: ["Sea"] },
  },
];

// Each frame hangs a little differently, like on a real wall.
const hangs = [
  { wire: 46, tilt: -3.5 },
  { wire: 30, tilt: 2.5 },
  { wire: 52, tilt: -1.5 },
  { wire: 34, tilt: 3 },
  { wire: 56, tilt: -2.5 },
  { wire: 38, tilt: 1.8 },
  { wire: 44, tilt: -2 },
];

const texts = {
  da: {
    eyebrow: "Projekter",
    title: "En væg af flyvninger, du kan bladre i.",
    open: "Klik for at se",
    cta: "Kontakt mig",
    close: "Luk",
    still: "Billede",
    video: "Video",
    soon: "Kommer snart",
    goTo: "Vis projekt",
    hint: "Træk væggen til siden, eller brug piletasterne",
  },
  en: {
    eyebrow: "Projects",
    title: "A wall of flights you can browse.",
    open: "Click to view",
    cta: "Contact me",
    close: "Close",
    still: "Still",
    video: "Video",
    soon: "Coming soon",
    goTo: "Show project",
    hint: "Drag the wall sideways, or use the arrow keys",
  },
};

const EASE = [0.16, 1, 0.3, 1] as const;
const START = 2;
const LAMP_ON = "linear-gradient(180deg,#fff6c8 0%,#f3d76a 45%,#c9a23c 100%)";
const BRASS = "linear-gradient(180deg,#e9cf7a 0%,#b8923a 55%,#7d6122 100%)";

/* ---------------------------------------------------------------- pieces -- */

const frameLook: Record<FrameStyle, { outer: React.CSSProperties; mat: string | null }> = {
  white: {
    outer: {
      background: "linear-gradient(135deg,#ffffff 0%,#ecebe8 45%,#d9d8d4 100%)",
      boxShadow:
        "inset 0 0 0 1px rgba(255,255,255,.9), inset -2px -3px 0 rgba(0,0,0,.08), inset 2px 2px 0 rgba(255,255,255,.7)",
    },
    mat: "#f6f5f1",
  },
  oak: {
    outer: {
      background: "linear-gradient(135deg,#d8bb92 0%,#b8956a 50%,#9c7a52 100%)",
      boxShadow: "inset 0 0 0 1px rgba(255,240,215,.35), inset -2px -3px 0 rgba(0,0,0,.18)",
    },
    mat: null,
  },
  black: {
    outer: {
      background: "linear-gradient(135deg,#2b2b2b 0%,#141414 55%,#050505 100%)",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12), inset -2px -3px 0 rgba(0,0,0,.5)",
    },
    mat: "#f3f2ee",
  },
};

/** The framed picture itself. `size` is the frame's outer height in px. */
function Framed({
  project,
  height,
  showVideo = false,
  lit = false,
}: {
  project: Project;
  height: number;
  showVideo?: boolean;
  lit?: boolean;
}) {
  const look = frameLook[project.frame];
  const border = Math.max(6, height * 0.045);
  const mat = look.mat ? Math.max(8, height * 0.07) : 0;
  const { lang } = useLang();
  return (
    <div
      className="relative"
      style={{
        ...look.outer,
        width: height * project.aspect,
        height,
        padding: border,
        boxShadow: `${look.outer.boxShadow}, 0 ${height * 0.08}px ${height * 0.2}px -${height * 0.04}px rgba(0,0,0,.75)`,
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          padding: mat,
          background: look.mat ?? undefined,
          boxShadow: look.mat ? "inset 1px 1px 3px rgba(0,0,0,.25)" : "inset 1px 1px 4px rgba(0,0,0,.5)",
        }}
      >
        <div className="relative h-full w-full overflow-hidden bg-neutral-900" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.15)" }}>
          {project.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.image} alt="" draggable={false} className="h-full w-full object-cover select-none" />
          ) : (
            <div
              className="flex h-full w-full items-end p-[8%]"
              style={{
                background: `radial-gradient(120% 90% at 30% 20%, ${project.tint?.[1]} 0%, ${project.tint?.[0]} 70%)`,
              }}
            >
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">{texts[lang].soon}</span>
            </div>
          )}
          {showVideo && project.video ? (
            <video
              key={project.video}
              src={project.video}
              poster={project.image}
              autoPlay
              muted
              loop
              playsInline
              // the Peugeot clips have black side bars baked in; zoom just past them
              className="absolute inset-0 h-full w-full scale-[1.08] object-cover"
            />
          ) : null}
          {/* light from the lamp falling across the top of the picture */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: lit ? 1 : 0,
              background: "linear-gradient(180deg, rgba(255,240,190,.18) 0%, rgba(255,240,190,0) 45%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** The brass bar on top of a frame; it lights up as a picture lamp on the active frame. */
function Lamp({ width, lit }: { width: number; lit: boolean }) {
  return (
    <div className="relative" style={{ width, height: 9 }}>
      <div
        className="absolute inset-0 rounded-full transition-[background,box-shadow] duration-500"
        style={{
          background: lit ? LAMP_ON : BRASS,
          boxShadow: lit
            ? "0 0 10px 2px rgba(255,226,120,.75), 0 0 34px 8px rgba(255,214,90,.35), 0 6px 40px 12px rgba(255,220,120,.18)"
            : "0 1px 2px rgba(0,0,0,.6)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ wall frame -- */

function HangingFrame({
  project,
  index,
  height,
  center,
  active,
  hidden,
  velocity,
  reduced,
  onPick,
  frameRef,
  label,
}: {
  project: Project;
  index: number;
  height: number;
  center: number;
  active: boolean;
  hidden: boolean;
  velocity: MotionValue<number>;
  reduced: boolean;
  onPick: (index: number, el: HTMLElement, rotation: number) => void;
  frameRef: (el: HTMLButtonElement | null) => void;
  label: string;
}) {
  const hang = hangs[index % hangs.length];
  const width = height * project.aspect;
  const wire = Math.round(hang.wire * (height / 220));
  const barWidth = Math.min(width * 0.62, 150);

  // Each frame swings on its nail when the wall moves, then settles with a few
  // dying wobbles. Slightly different springs per frame so they don't move in lockstep.
  const push = useTransform(velocity, (v) => (reduced ? 0 : Math.max(-16, Math.min(16, v * 0.012))));
  const swing = useSpring(push, {
    stiffness: 90 + (index % 3) * 22,
    damping: 5.5 + (index % 2) * 1.5,
    mass: 1,
  });
  const rest = useSpring(active ? 0 : hang.tilt, { stiffness: 120, damping: 14 });
  useEffect(() => rest.set(active ? 0 : hang.tilt), [active, hang.tilt, rest]);
  const rotate = useTransform(() => swing.get() + rest.get());

  return (
    <div className="absolute top-0" style={{ left: center - width / 2, width }}>
      {/* the nail on the rail */}
      <div
        className="absolute left-1/2 -top-[14px] h-[18px] w-[5px] -translate-x-1/2 rounded-sm"
        style={{ background: BRASS, boxShadow: "0 2px 3px rgba(0,0,0,.6)" }}
      />
      <motion.div className="relative" style={{ rotate, transformOrigin: "50% 0%" }}>
        {/* wires from the nail to the ends of the bar */}
        <svg className="absolute left-0 top-0 overflow-visible" width={width} height={wire} aria-hidden="true">
          <path
            d={`M ${width / 2} 2 L ${(width - barWidth) / 2 + 8} ${wire} M ${width / 2} 2 L ${(width + barWidth) / 2 - 8} ${wire}`}
            stroke="rgba(200,200,200,.55)"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
        <div style={{ height: wire }} />
        <div className="relative flex justify-center" style={{ marginBottom: -3, zIndex: 2 }}>
          <Lamp width={barWidth} lit={active} />
        </div>

        <motion.button
          ref={frameRef}
          type="button"
          aria-label={label}
          onClick={(e) => onPick(index, e.currentTarget, rotate.get())}
          whileHover={active ? { scale: 1.035, y: -4 } : { scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          style={{ visibility: hidden ? "hidden" : "visible" }}
        >
          <div className="transition-[filter] duration-500" style={{ filter: active ? "none" : "brightness(.72) saturate(.85)" }}>
            <Framed project={project} height={height} lit={active} />
          </div>
        </motion.button>

      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------- wall -- */

type Opened = { index: number; origin: HTMLElement; rotation: number };

export function GalleryWall() {
  const t = useT(texts);
  const { lang } = useLang();
  const reduced = !!useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const frameEls = useRef<(HTMLButtonElement | null)[]>([]);
  const [stageWidth, setStageWidth] = useState(0);
  // start in the middle so the wall is filled on both sides
  const [active, setActive] = useState(START);
  const [opened, setOpened] = useState<Opened | null>(null);
  const dragged = useRef(false);
  // where the wall is heading, so quick arrow presses add up
  const target = useRef(START);

  const x = useMotionValue(0);
  const velocity = useVelocity(x);

  // Frame size follows the screen: smaller on phones, capped on big screens.
  const height = Math.round(stageWidth < 640 ? Math.min(200, stageWidth * 0.42) : Math.max(170, Math.min(250, stageWidth * 0.19)));
  // tighter on phones so the neighbours peek in and invite a swipe
  const gap = height * (stageWidth < 640 ? 0.22 : 0.42);
  const widths = useMemo(() => projects.map((p) => height * p.aspect), [height]);
  const centers = useMemo(() => {
    const out: number[] = [];
    widths.reduce((left, w) => {
      out.push(left + w / 2);
      return left + w + gap;
    }, 0);
    return out;
  }, [widths, gap]);
  const offsetFor = useCallback((i: number) => stageWidth / 2 - centers[i], [stageWidth, centers]);
  const minX = offsetFor(projects.length - 1);
  const maxX = offsetFor(0);
  const stageHeight = height + 60 * (height / 220) + 70;

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageWidth(el.clientWidth));
    ro.observe(el);
    setStageWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // keep the active frame centred when the layout changes
  useEffect(() => {
    if (stageWidth) x.set(offsetFor(active));
    // only on resize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageWidth, height]);

  // the frame nearest the middle is the lit one, also while dragging
  useEffect(
    () =>
      x.on("change", (v) => {
        let best = 0;
        let dist = Infinity;
        centers.forEach((c, i) => {
          const d = Math.abs(v + c - stageWidth / 2);
          if (d < dist) {
            dist = d;
            best = i;
          }
        });
        setActive(best);
      }),
    [x, centers, stageWidth],
  );

  const goTo = useCallback(
    (i: number, fromVelocity = 0) => {
      target.current = Math.max(0, Math.min(projects.length - 1, i));
      animate(x, offsetFor(target.current), {
        type: "spring",
        stiffness: 170,
        damping: 26,
        velocity: fromVelocity,
      });
    },
    [x, offsetFor],
  );

  const onPick = (i: number, el: HTMLElement, rotation: number) => {
    if (dragged.current) return;
    if (i !== active) goTo(i);
    else setOpened({ index: i, origin: el, rotation });
  };

  const project = projects[active];

  return (
    <section id="projekter" className="relative w-full scroll-mt-16 overflow-x-clip py-24 md:py-32">
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-400">{t.eyebrow}</p>
        <h2 className="mt-4 text-2xl font-normal tracking-tight text-white md:text-4xl">{t.title}</h2>
      </div>

      {/* the rail */}
      <div className="relative mt-10 md:mt-12">
        {/* soft wash of lamp light on the wall behind the active frame */}
        <div
          className="pointer-events-none absolute left-1/2"
          style={{
            top: stageHeight * 0.5,
            width: height * 3.2,
            height: height * 2.4,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(closest-side, rgba(255,226,140,.10), rgba(255,226,140,0))",
          }}
        />
        <div
          className="h-[9px] w-full"
          style={{
            background: "linear-gradient(180deg,#3a3a3a 0%,#1c1c1c 45%,#0e0e0e 100%)",
            boxShadow: "0 1px 0 rgba(255,255,255,.08) inset, 0 6px 14px rgba(0,0,0,.7)",
          }}
        />

        <div
          ref={stageRef}
          tabIndex={0}
          aria-label={t.hint}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goTo(target.current + 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              goTo(target.current - 1);
            } else if (e.key === "Enter" && frameEls.current[active]) {
              e.preventDefault();
              const el = frameEls.current[active]!;
              setOpened({ index: active, origin: el, rotation: 0 });
            }
          }}
          className="relative mt-[5px] cursor-grab outline-none active:cursor-grabbing"
          style={{ height: stageHeight }}
        >
          {stageWidth > 0 ? (
            <motion.div
              drag="x"
              dragMomentum={false}
              dragElastic={0.14}
              dragConstraints={{ left: minX, right: maxX }}
              onDragStart={() => {
                dragged.current = true;
              }}
              onDragEnd={(_, info) => {
                // land on the frame the throw is heading for
                const projected = x.get() + info.velocity.x * 0.22;
                let best = 0;
                centers.forEach((c, i) => {
                  if (Math.abs(projected + c - stageWidth / 2) < Math.abs(projected + centers[best] - stageWidth / 2))
                    best = i;
                });
                goTo(best, info.velocity.x);
                setTimeout(() => (dragged.current = false), 0);
              }}
              className="absolute left-0 top-[14px] h-full touch-pan-y"
              style={{ x, width: centers[centers.length - 1] + widths[widths.length - 1] / 2 }}
            >
              {projects.map((p, i) => (
                <HangingFrame
                  key={i}
                  project={p}
                  index={i}
                  height={height}
                  center={centers[i]}
                  active={i === active}
                  hidden={opened?.index === i}
                  velocity={velocity}
                  reduced={reduced}
                  onPick={onPick}
                  frameRef={(el) => {
                    frameEls.current[i] = el;
                  }}
                  label={i === active ? `${p.title[lang]}. ${t.open}` : `${t.goTo}: ${p.title[lang]}`}
                />
              ))}
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* dots + caption */}
      <div className="relative mt-2 flex flex-col items-center px-6 text-center">
        <div className="flex items-center gap-1.5">
          {projects.map((p, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${t.goTo}: ${p.title[lang]}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === active ? 22 : 6, background: i === active ? "#fff" : "rgba(255,255,255,.28)" }}
            />
          ))}
        </div>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-5"
        >
          <p className="text-sm text-white">{project.title[lang]}</p>
          <p className="mt-1 text-sm text-neutral-400 md:text-base">
            {project.meta[lang]} ·{" "}
            <button
              type="button"
              onClick={() => frameEls.current[active] && setOpened({ index: active, origin: frameEls.current[active]!, rotation: 0 })}
              className="text-neutral-200 underline-offset-4 hover:underline"
            >
              {t.open}
            </button>
          </p>
        </motion.div>
        <Link
          href="/kontakt"
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors duration-200 hover:bg-neutral-200"
        >
          {t.cta}
          <ArrowUpRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {opened
        ? createPortal(
            <Detail opened={opened} onClose={() => setOpened(null)} />,
            document.body,
          )
        : null}
    </section>
  );
}

/* --------------------------------------------------------------- detail -- */

function Detail({ opened, onClose }: { opened: Opened; onClose: () => void }) {
  const t = useT(texts);
  const { lang } = useLang();
  const project = projects[opened.index];
  const [tab, setTab] = useState<"still" | "video">("still");
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const frameRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Big frame: as large as fits next to the text on desktop, above it on phones.
  const wide = vp.w >= 768;
  const maxW = wide ? vp.w * 0.5 : vp.w - 48;
  const maxH = wide ? vp.h * 0.62 : vp.h * 0.42;
  const height = Math.max(120, Math.min(maxH, maxW / project.aspect));
  const barWidth = Math.min(height * project.aspect * 0.5, 280);

  /** Offset that lays the big frame over the small one on the wall. */
  const fromOrigin = useCallback(() => {
    const el = frameRef.current;
    if (!el) return { x: 0, y: 0, scale: 1 };
    const to = el.getBoundingClientRect();
    const from = opened.origin.getBoundingClientRect();
    // the bounding box of a tilted frame is a bit bigger than the frame
    const rad = (Math.abs(opened.rotation) * Math.PI) / 180;
    const fromW = from.width / (Math.cos(rad) + Math.sin(rad) / project.aspect);
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: fromW / to.width,
    };
  }, [opened, project.aspect]);

  // lift the frame off the wall
  useLayoutEffect(() => {
    if (!vp.w || !frameRef.current || !backdropRef.current || !infoRef.current) return;
    if (frameRef.current.dataset.lifted) return;
    frameRef.current.dataset.lifted = "1";
    const { x, y, scale } = fromOrigin();
    animate(backdropRef.current, { opacity: [0, 1] }, { duration: 0.45, ease: "easeOut" });
    animate(
      frameRef.current,
      { x: [x, 0], y: [y, 0], scale: [scale, 1], rotate: [opened.rotation, 0] },
      { duration: 0.65, ease: EASE },
    );
    animate(infoRef.current, { opacity: [0, 1], x: [24, 0] }, { duration: 0.5, delay: 0.25, ease: EASE });
    closeRef.current?.focus({ preventScroll: true });
  }, [vp.w, fromOrigin, opened.rotation]);

  // …and hang it back
  const close = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    const frame = frameRef.current;
    const backdrop = backdropRef.current;
    const info = infoRef.current;
    if (frame && backdrop && info) {
      const { x, y, scale } = fromOrigin();
      await Promise.all([
        animate(info, { opacity: 0, x: 16 }, { duration: 0.2 }),
        animate(backdrop, { opacity: 0 }, { duration: 0.45, delay: 0.05, ease: "easeIn" }),
        animate(frame, { x, y, scale, rotate: opened.rotation }, { duration: 0.55, ease: [0.4, 0, 0.2, 1] }),
      ]);
    }
    onClose();
  }, [fromOrigin, onClose, opened.rotation]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [close]);

  return (
    <div role="dialog" aria-modal="true" aria-label={project.title[lang]} className="fixed inset-0 z-[100]">
      <div
        ref={backdropRef}
        onClick={close}
        className="absolute inset-0 bg-[#0a0a0a]"
        style={{
          opacity: 0,
          backgroundImage:
            "radial-gradient(60% 55% at 35% 45%, rgba(255,226,140,.08), rgba(0,0,0,0) 70%), radial-gradient(40% 40% at 75% 50%, rgba(255,255,255,.03), rgba(0,0,0,0) 70%)",
        }}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={close}
        className="absolute right-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-neutral-200 backdrop-blur transition hover:bg-white/10"
      >
        <X size={14} /> {t.close}
      </button>

      <div className="pointer-events-none relative flex h-full flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-20 md:flex-row md:gap-14">
        {vp.w ? (
          <div ref={frameRef} className="pointer-events-auto flex shrink-0 flex-col items-center will-change-transform">
            {/* picture lamp */}
            <div className="relative flex flex-col items-center" style={{ width: barWidth }}>
              <Lamp width={barWidth} lit />
              <div className="flex w-1/2 justify-between">
                <span className="block h-6 w-[2px]" style={{ background: BRASS }} />
                <span className="block h-6 w-[2px]" style={{ background: BRASS }} />
              </div>
            </div>
            <Framed project={project} height={height} showVideo={tab === "video"} lit />
          </div>
        ) : null}

        <div ref={infoRef} className="pointer-events-auto w-full max-w-sm" style={{ opacity: 0 }}>
          <p className="font-mono text-xs tracking-[0.3em] text-neutral-400">
            {String(opened.index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <h2 className="mt-3 text-3xl font-normal tracking-tight text-white">{project.title[lang]}</h2>
          <p className="mt-2 text-sm text-neutral-400">{project.meta[lang]}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-300">{project.description[lang]}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags[lang].map((tag) => (
              <span key={tag} className="rounded-full border border-white/12 px-3 py-1 text-xs text-neutral-300">
                {tag}
              </span>
            ))}
          </div>
          {project.video ? (
            <div className="mt-6 flex gap-6 text-sm" role="tablist">
              {(["still", "video"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`border-b pb-1 transition-colors ${
                    tab === k ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {t[k]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
