"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { arrowPaths, boxPath, ovalPath, parseMarks, underlineMorph, underlinePath, type Pt } from "@/lib/pen";

/* The building blocks of the "notesbog" look on the front page (after a CV template Peter
   picked): pale paper sheets and a dark night sheet, big serif headings, and a blue pen that
   draws boxes, ovals, underlines, arrows and handwritten notes in the margins.
   A pen stroke draws itself in the first time its block comes into view: anything inside an
   element with data-ink gets drawn when that element scrolls in (see .mg-* in globals.css). */

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Marks `data-ink="on"` on every [data-ink] element inside the sheet once it comes into view. */
function useInk(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-ink]"));
    if (el.hasAttribute("data-ink")) targets.push(el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.ink = "on";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [root]);
}

/** One sheet of the notebook: paper (light) or night (dark), with a fine dot grain. */
export function Sheet({
  tone = "paper",
  id,
  className,
  children,
  grow,
}: {
  tone?: "paper" | "night";
  id?: string;
  className?: string;
  children: ReactNode;
  /** Night sheet only: grow from a rounded card into the full width as it scrolls in. */
  grow?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useInk(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0% 4% 0% 4% round 48px)", "inset(0% 0% 0% 0% round 0px)"]);
  return (
    <section ref={ref} id={id} data-tone={tone} className={"mg-sheet" + (className ? " " + className : "")}>
      {tone === "night" ? (
        <motion.div aria-hidden="true" className="mg-sheet-bg" style={grow && !reduced ? { clipPath: clip } : undefined} />
      ) : null}
      <div className="mg-grain" aria-hidden="true" />
      {children}
    </section>
  );
}

/** A pen mark drawn around (oval, box) or under its parent element, sized to it. */
export function PenMark({
  kind,
  seed = 1,
  padX = 10,
  padY = 6,
  delay = 0,
}: {
  kind: "oval" | "under" | "box";
  seed?: number;
  padX?: number;
  padY?: number;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useIso(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const measure = () => {
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);
  const W = Math.max(1, box.w + padX * 2);
  const H = Math.max(1, box.h + padY * 2);
  const d = box.w === 0 ? "" : kind === "oval" ? ovalPath(W, H, seed) : kind === "under" ? underlinePath(W, H, seed) : boxPath(box.w, box.h, seed);
  const vb = kind === "box" ? `${-padX} ${-padY} ${W} ${H}` : `0 0 ${W} ${H}`;
  return (
    <svg
      ref={ref}
      className="mg-mark"
      aria-hidden="true"
      viewBox={vb}
      style={{ left: -padX, top: -padY, width: W, height: H }}
    >
      <path className="mg-draw" pathLength={1} d={d} style={{ "--d": `${delay}s` } as React.CSSProperties} />
    </svg>
  );
}

/** Text where *phrase* gets a pen underline and [phrase] gets a pen oval. */
export function Marked({ text, seed = 1, delay = 0.5 }: { text: string; seed?: number; delay?: number }) {
  let n = 0;
  return (
    <>
      {parseMarks(text).map((m, i) =>
        m.mark ? (
          <span key={i} className="mg-mk">
            {m.text}
            <PenMark
              kind={m.mark}
              seed={seed + i}
              padX={m.mark === "oval" ? 9 : 1}
              padY={m.mark === "oval" ? 4 : 7}
              delay={delay + 0.35 * n++}
            />
          </span>
        ) : (
          <Fragment key={i}>{m.text}</Fragment>
        ),
      )}
    </>
  );
}

/** A curved pen arrow inside an SVG (use in an svg with className="mg-ink"). */
export function Arrow({ a, b, bend = 0.2, head = 9, delay = 0 }: { a: Pt; b: Pt; bend?: number; head?: number; delay?: number }) {
  const p = arrowPaths(a, b, bend, head);
  return (
    <g>
      <path className="mg-draw" pathLength={1} d={p.shaft} style={{ "--d": `${delay}s` } as React.CSSProperties} />
      <path className="mg-draw" pathLength={1} d={p.head} style={{ "--d": `${delay + 0.45}s`, "--dur": "0.3s" } as React.CSSProperties} />
    </g>
  );
}

/** Handwriting that writes itself in from left to right. */
export function Write({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="mg-write" style={{ "--d": `${delay}s` } as React.CSSProperties}>
      {children}
    </span>
  );
}

/** A big serif heading: the letters rise in, and its pen underline goes from a nervous
    zig-zag to a calm swoosh as it scrolls up the screen. */
export function Heading({ text, seed, className, as = "h2" }: { text: string; seed: number; className?: string; as?: "h2" | "h3" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const m = useMemo(() => underlineMorph(300, seed), [seed]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.35"] });
  const d = useTransform(scrollYProgress, [0.25, 1], [m.from, m.to]);
  const Tag = as;
  let ci = 0;
  return (
    <div ref={ref} className="mg-hd" data-ink>
      <Tag className={"mg-display mg-h2" + (className ? " " + className : "")} aria-label={text}>
        {text.split(" ").map((word, wi, words) => (
          <Fragment key={wi}>
            <span className="mg-w" aria-hidden="true">
              {Array.from(word).map((c, i) => (
                <span key={i} className="mg-c">
                  <span className="mg-ci" style={{ "--i": ci++ } as React.CSSProperties}>
                    {c}
                  </span>
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </Tag>
      <svg className="mg-uline" viewBox="0 0 300 26" aria-hidden="true">
        <motion.path className="mg-draw" pathLength={1} d={reduced ? m.to : d} style={{ "--d": "0.35s" } as React.CSSProperties} />
      </svg>
    </div>
  );
}

/** Small ink doodles, drawn as pen strokes in a 64×64 box. */
export const DOODLES = {
  pencil: ["M12 52l4-13 27-27 9 9-27 27z", "M16 39l9 9", "M38 17l9 9", "M12 52l9-4", "M5 58c10-3 20 2 30-1"],
  // a little quadcopter seen from above: the X frame, four props and the camera at the front
  drone: [
    "M20 20L44 44",
    "M44 20L20 44",
    "M20 20m-9 0a9 4 0 1 0 18 0a9 4 0 1 0 -18 0",
    "M44 20m-9 0a9 4 0 1 0 18 0a9 4 0 1 0 -18 0",
    "M20 44m-9 0a9 4 0 1 0 18 0a9 4 0 1 0 -18 0",
    "M44 44m-9 0a9 4 0 1 0 18 0a9 4 0 1 0 -18 0",
    "M27 27h10v10H27z",
    "M30 27v-3h4v3",
  ],
} as const;

export function Doodle({ kind, className, delay = 0 }: { kind: keyof typeof DOODLES; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 64 64" className={"mg-ink" + (className ? " " + className : "")} aria-hidden="true">
      {DOODLES[kind].map((d, i) => (
        <path key={i} className="mg-draw" pathLength={1} d={d} style={{ "--d": `${delay + i * 0.12}s` } as React.CSSProperties} />
      ))}
    </svg>
  );
}
