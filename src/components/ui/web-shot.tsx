"use client";

import { useEffect, useRef, type RefObject } from "react";

/* ==========================================================================
   Spindelvæv mod musen

   Inside the area (the "Lad os arbejde sammen" panel) thin silk threads shoot
   from the edge of the button that faces the cursor, grab the cursor and pull
   on it: the cursor is drawn by the page and sits a little closer to the
   button than the real mouse, so it looks dragged toward it, and the button
   leans toward the cursor. Over the button itself the real pointer is back.

   A browser can't move the real mouse. So if the mouse stands completely still
   inside the area for `idleMs`, the drawn cursor glides onto the button on its
   own and presses it, which opens the page the button links to. Any movement
   or scroll before that cancels it.

   Only for a real mouse (hover + fine pointer) and not with reduced motion;
   on phones the button stays a plain button.
   ========================================================================== */

const SEGS = 16;
const SPREAD = 17;
const DAMP = 0.9;
const GRAVITY = 0.03;
const GLIDE_MS = 1100;

type Pt = { x: number; y: number; px: number; py: number };
type Thread = { pts: Pt[]; lag: number; ax: number; ay: number; seeded: boolean };

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

export function WebShotLayer({
  areaRef,
  targetRef,
  leanRef,
  idleMs = 10000,
  threads = 5,
  ink = "#f3ead2",
}: {
  /** The positioned element the threads live in; this layer must be its direct child. */
  areaRef: RefObject<HTMLElement | null>;
  /** An untransformed box around the button: where the threads start. */
  targetRef: RefObject<HTMLElement | null>;
  /** The element that leans toward the cursor and is pressed; it holds the link. */
  leanRef: RefObject<HTMLElement | null>;
  idleMs?: number;
  threads?: number;
  ink?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const target = targetRef.current;
    const lean = leanRef.current;
    const cv = canvasRef.current;
    const cur = cursorRef.current;
    const ring = ringRef.current;
    const ctx = cv?.getContext("2d");
    if (!area || !target || !lean || !cv || !cur || !ring || !ctx) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const n = Math.max(1, Math.round(threads));
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let ext = 0;
    let shown = false;
    const pointer = { x: 0, y: 0, known: false, lastMove: 0 };
    const hold = { x: 0, y: 0 };
    let auto: { t0: number; fx: number; fy: number; pressed: boolean } | null = null;
    const list: Thread[] = Array.from({ length: n }, (_, i) => ({
      pts: Array.from({ length: SEGS }, () => ({ x: 0, y: 0, px: 0, py: 0 })),
      lag: 0.16 + (((i * 37) % 10) / 10) * 0.2,
      ax: 0,
      ay: 0,
      seeded: false,
    }));

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = area.offsetWidth;
      H = area.offsetHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };

    const showCursor = (on: boolean) => {
      if (on === shown) return;
      shown = on;
      cur.style.opacity = on ? "1" : "0";
      area.style.cursor = on ? "none" : "";
    };

    const path = (pts: { x: number; y: number }[]) => {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length - 1; j++) {
        ctx.quadraticCurveTo(pts[j].x, pts[j].y, (pts[j].x + pts[j + 1].x) / 2, (pts[j].y + pts[j + 1].y) / 2);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    };

    const draw = () => {
      ctx.save();
      ctx.strokeStyle = ink;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.2;
      for (const s of list) {
        ctx.beginPath();
        path(s.pts);
        ctx.stroke();
      }
      // the cross strands that make it a web
      if (ext > 0.35) {
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.65 * Math.min(1, (ext - 0.35) * 3);
        for (const at of [0.4, 0.62, 0.84]) {
          const j = Math.round(at * (SEGS - 1));
          for (let i = 0; i < list.length - 1; i++) {
            const a = list[i].pts[j];
            const b = list[i + 1].pts[j];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 3, b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      raf = 0;
      // The panel scales with the scroll, so map screen coordinates into its own.
      const ar = area.getBoundingClientRect();
      const k = ar.width ? W / ar.width : 1;
      const toX = (cx: number) => (cx - ar.left) * k;
      const toY = (cy: number) => (cy - ar.top) * k;
      const tr = target.getBoundingClientRect();
      const bx = toX(tr.left);
      const by = toY(tr.top);
      const bw = tr.width * k;
      const bh = tr.height * k;
      const r = bh / 2;
      const bcx = bx + bw / 2;
      const bcy = by + bh / 2;

      // Nearest point of the pill: centre of its end circle, outward normal, distance outside the edge.
      const cap = (x: number, y: number) => {
        const cx = Math.min(Math.max(x, bx + r), bx + bw - r);
        const dx = x - cx;
        const dy = y - bcy;
        const d = Math.hypot(dx, dy) || 1e-6;
        return { cx, cy: bcy, nx: dx / d, ny: dy / d, dist: d - r };
      };

      const px = toX(pointer.x);
      const py = toY(pointer.y);
      const inside = pointer.known && px >= 0 && py >= 0 && px <= W && py <= H;
      const overBtn =
        pointer.known && pointer.x >= tr.left && pointer.x <= tr.right && pointer.y >= tr.top && pointer.y <= tr.bottom;

      // Standing still for long enough: take over and fly the cursor onto the button.
      if (!auto && inside && !overBtn && now - pointer.lastMove > idleMs && document.visibilityState === "visible") {
        auto = { t0: now, fx: hold.x || px, fy: hold.y || py, pressed: false };
      }

      // Where the drawn cursor is: pulled a little toward the button, or gliding there on its own.
      let cx = px;
      let cy = py;
      let active = inside && !overBtn;
      if (auto) {
        const u = Math.min(1, (now - auto.t0) / GLIDE_MS);
        const e = ease(u);
        cx = auto.fx + (bcx - auto.fx) * e;
        cy = auto.fy + (bcy - auto.fy) * e;
        active = cap(cx, cy).dist > 2;
        if (u >= 1 && !auto.pressed) {
          auto.pressed = true;
          press();
        }
      } else if (active) {
        const c = cap(px, py);
        const pull = Math.min(22, Math.max(0, c.dist) * 0.09);
        cx = px - c.nx * pull;
        cy = py - c.ny * pull;
      }

      showCursor(Boolean(auto) || (inside && !overBtn));
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

      if (active) {
        hold.x = cx;
        hold.y = cy;
      }
      ext += ((active ? 1 : 0) - ext) * (active ? 0.12 : 0.22);
      if (!active && ext < 0.003) ext = 0;

      // The button leans toward whatever has hold of it.
      if (ext > 0) {
        const dx = hold.x - bcx;
        const dy = hold.y - bcy;
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(12, d * 0.04) * ext;
        lean.style.transform = `translate3d(${(dx / d) * m}px, ${(dy / d) * m}px, 0)`;
      } else {
        lean.style.transform = "";
      }

      const hc = cap(hold.x, hold.y);
      const perpX = -hc.ny;
      const perpY = hc.nx;
      const inset = Math.min(6, r * 0.5);

      list.forEach((s, i) => {
        const o = i - (n - 1) / 2;
        const b = cap(hc.cx + hc.nx * (r - inset) + perpX * o * SPREAD, hc.cy + hc.ny * (r - inset) + perpY * o * SPREAD);
        const axT = b.cx + b.nx * (r - inset);
        const ayT = b.cy + b.ny * (r - inset);
        if (!s.seeded) {
          s.ax = axT;
          s.ay = ayT;
          for (const q of s.pts) {
            q.x = q.px = axT;
            q.y = q.py = ayT;
          }
          s.seeded = true;
        }
        s.ax += (axT - s.ax) * 0.3;
        s.ay += (ayT - s.ay) * 0.3;
        const dx = hold.x - s.ax;
        const dy = hold.y - s.ay;
        const d = Math.hypot(dx, dy) || 1e-6;
        const len = ext * d;
        const seg = len / (SEGS - 1);
        const pts = s.pts;
        for (let j = 1; j < pts.length; j++) {
          const q = pts[j];
          const vx = (q.x - q.px) * DAMP;
          const vy = (q.y - q.py) * DAMP;
          q.px = q.x;
          q.py = q.y;
          q.x += vx;
          q.y += vy + GRAVITY * ext;
        }
        const tip = pts[pts.length - 1];
        tip.x += (s.ax + (dx / d) * len - tip.x) * s.lag;
        tip.y += (s.ay + (dy / d) * len - tip.y) * s.lag;
        pts[0].x = pts[0].px = s.ax;
        pts[0].y = pts[0].py = s.ay;
        for (let it = 0; it < 6; it++) {
          for (let j = 1; j < pts.length; j++) {
            const a = pts[j - 1];
            const q = pts[j];
            const ex = q.x - a.x;
            const ey = q.y - a.y;
            const el = Math.hypot(ex, ey) || 1e-6;
            if (el <= seg) continue;
            const diff = (el - seg) / el;
            if (j === 1) {
              q.x -= ex * diff;
              q.y -= ey * diff;
            } else {
              a.x += ex * diff * 0.5;
              a.y += ey * diff * 0.5;
              q.x -= ex * diff * 0.5;
              q.y -= ey * diff * 0.5;
            }
          }
        }
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (ext > 0.01) draw();

      if (inside || ext > 0 || auto) kick();
      else for (const s of list) s.seeded = false;
    };

    // The drawn cursor clicks, the button sinks in, and the link opens.
    const press = () => {
      cur.animate([{ scale: "1" }, { scale: "0.8" }, { scale: "1" }], { duration: 260, easing: "ease-out" });
      ring.animate(
        [
          { opacity: 0.9, scale: "0.4" },
          { opacity: 0, scale: "2.4" },
        ],
        { duration: 520, easing: "ease-out" },
      );
      lean.animate([{ scale: "1" }, { scale: "0.93" }, { scale: "1" }], { duration: 300, easing: "ease-out" });
      window.setTimeout(() => {
        lean.querySelector("a")?.click();
        window.setTimeout(() => {
          auto = null;
          pointer.lastMove = performance.now();
        }, 1500);
      }, 220);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // Browsers send a still pointer a move event when the page scrolls under it; that isn't moving.
      const moved = !pointer.known || e.movementX !== 0 || e.movementY !== 0;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.known = true;
      if (moved) {
        pointer.lastMove = performance.now();
        if (auto && !auto.pressed) auto = null;
      }
      kick();
    };
    const onActivity = () => {
      pointer.lastMove = performance.now();
      if (auto && !auto.pressed) auto = null;
      if (pointer.known) kick();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      pointer.known = false;
      kick();
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(area);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("wheel", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", onActivity);
      window.removeEventListener("keydown", onActivity);
      document.removeEventListener("pointerout", onOut);
      area.style.cursor = "";
      lean.style.transform = "";
    };
  }, [areaRef, targetRef, leanRef, idleMs, threads, ink]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      {/* the cursor the page draws while the threads have hold of it */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-30 opacity-0 transition-opacity duration-150"
      >
        <div ref={ringRef} className="absolute -left-4 -top-4 size-8 rounded-full border-2 border-sol-200 opacity-0" />
        <svg width="22" height="26" viewBox="0 0 22 26" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]">
          <path
            d="M1.5 1.5 L1.5 20.5 L6.6 15.7 L10.2 23.6 L13.6 22.1 L10.1 14.4 L17.2 14.4 Z"
            fill="#f3ead2"
            stroke="#3a3529"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
