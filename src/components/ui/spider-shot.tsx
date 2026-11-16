"use client";

import { useEffect, useRef, type RefObject } from "react";

/* ==========================================================================
   Stickman med spindelvæv

   Nothing shows while the mouse moves around the area (the "Lad os arbejde
   sammen" panel). If the mouse stands completely still in the area for
   `idleMs`, a little stickman pops out from behind the button on the side
   that faces the cursor:

   - cursor below the button: he drops out of its bottom edge and hangs upside
     down on a short thread, feet hooked under the button;
   - cursor above (or level with) it: he peeks over the top edge, just his
     head, a bit of his body and the arm he shoots with.

   If the cursor is within his reach he leans out, grabs it with his hand and
   drags it in. Otherwise he aims, shoots a web line at it and yanks it hard
   onto the button. The button is then pressed and the link opens. A browser
   can't move the real mouse, so from the moment he shows up the real pointer
   is hidden and the page draws a cursor in its place. Moving the mouse before
   he has hold of it sends him back behind the button.

   Only for a real mouse (hover + fine pointer) and not with reduced motion;
   on phones the button stays a plain button.
   ========================================================================== */

/* Timeline in ms, kept short on purpose: it should feel abrupt. */
const EMERGE = 210;
const AIM = 120;
const SHOOT = 110;
const HOLD = 50;
const YANK = 150;
const HIDE = 160;

const INK = "#111111";
const RIM = "rgba(255, 255, 255, 0.95)";
const WEB = "#111111";

type Pt = { x: number; y: number };
type Anim = {
  t0: number;
  from: Pt; // where the drawn cursor starts (panel coords)
  hang: boolean; // upside down under the button, or peeking over it
  side: 1 | -1; // which way he faces
  along: number; // where on the button edge he sits, as a fraction of the flat part
  grab: boolean; // close enough to just reach out and grab it, instead of shooting
  hidingAt: number; // > 0 once he is going back behind the button
  pressed: boolean;
};

const clamp01 = (u: number) => Math.min(1, Math.max(0, u));

/* Figure size follows the button. Arm: two bones of ARM each; LEAN: how far he can lean out. */
const scaleFor = (bh: number) => Math.max(1.1, Math.min(1.8, (bh / 56) * 1.45));
const ARM = 10;
const LEAN = 12;
/* His shoulder when fully out, in figure units: sideways (facing the cursor) and out from the edge. */
const SHOULDER = { hang: [3, 48], peek: [2, 4] } as const;
const outCubic = (u: number) => 1 - Math.pow(1 - u, 3);
const inCubic = (u: number) => u * u * u;
const inOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

export function SpiderShotLayer({
  areaRef,
  targetRef,
  leanRef,
  idleMs = 5000,
}: {
  /** The positioned element the stickman lives in; this layer must be its direct child. */
  areaRef: RefObject<HTMLElement | null>;
  /** An untransformed box around the button: the edge he climbs out of. */
  targetRef: RefObject<HTMLElement | null>;
  /** The element that jolts when the cursor lands and is pressed; it holds the link. */
  leanRef: RefObject<HTMLElement | null>;
  idleMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

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

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let timer = 0;
    let anim: Anim | null = null;
    const pointer = { x: 0, y: 0, known: false };

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = area.offsetWidth;
      H = area.offsetHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };

    const showCursor = (on: boolean) => {
      cur.style.opacity = on ? "1" : "0";
      area.style.cursor = on ? "none" : "";
    };

    // The panel scales with the scroll, so map screen coordinates into its own.
    const frame = () => {
      const ar = area.getBoundingClientRect();
      const k = ar.width ? W / ar.width : 1;
      const tr = target.getBoundingClientRect();
      const bx = (tr.left - ar.left) * k;
      const by = (tr.top - ar.top) * k;
      const bw = tr.width * k;
      const bh = tr.height * k;
      return {
        k,
        toX: (cx: number) => (cx - ar.left) * k,
        toY: (cy: number) => (cy - ar.top) * k,
        bx,
        by,
        bw,
        bh,
        r: bh / 2,
        tr,
      };
    };

    const pointerInside = () => {
      if (!pointer.known || document.visibilityState !== "visible") return false;
      const f = frame();
      const px = f.toX(pointer.x);
      const py = f.toY(pointer.y);
      const inside = px >= 0 && py >= 0 && px <= W && py <= H;
      const t = f.tr;
      const overBtn = pointer.x >= t.left && pointer.x <= t.right && pointer.y >= t.top && pointer.y <= t.bottom;
      return inside && !overBtn;
    };

    const start = () => {
      if (anim || !pointerInside()) return;
      const f = frame();
      const px = f.toX(pointer.x);
      const py = f.toY(pointer.y);
      const flatL = f.bx + f.r + 6;
      const flatR = f.bx + f.bw - f.r - 6;
      const ex = Math.min(flatR, Math.max(flatL, px));
      const hang = py > f.by + f.bh / 2;
      const side = px >= ex ? 1 : -1;
      const S = scaleFor(f.bh);
      const [sx, sy] = hang ? SHOULDER.hang : SHOULDER.peek;
      const shX = ex + sx * side * S;
      const shY = (hang ? f.by + f.bh : f.by) + sy * (hang ? 1 : -1) * S;
      const grab = Math.hypot(px - shX, py - shY) <= (2 * ARM * 0.97 + LEAN) * S;
      anim = {
        t0: performance.now(),
        from: { x: px, y: py },
        hang,
        side,
        grab,
        along: flatR > flatL ? (ex - flatL) / (flatR - flatL) : 0.5,
        hidingAt: 0,
        pressed: false,
      };
      cur.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      showCursor(true);
      kick();
    };

    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(start, idleMs);
    };

    // Back behind the button, as long as the web hasn't hit yet.
    const retreat = () => {
      if (!anim || anim.hidingAt || anim.pressed) return;
      const t = performance.now() - anim.t0;
      if (t > EMERGE + AIM) return;
      anim.hidingAt = performance.now();
      showCursor(false);
      kick();
    };

    /* ---------------- drawing ---------------- */

    const limb = (pts: Pt[]) => {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    };

    // Two-bone arm/leg from a to a point `reach` away in direction `ang`, bending to `bendSide`.
    const bone = (a: Pt, ang: number, reach: number, seg: number, bendSide: number): Pt[] => {
      const d = Math.min(reach, seg * 2 - 0.01);
      const end = { x: a.x + Math.cos(ang) * d, y: a.y + Math.sin(ang) * d };
      const m = { x: (a.x + end.x) / 2, y: (a.y + end.y) / 2 };
      const off = Math.sqrt(Math.max(0, seg * seg - (d / 2) * (d / 2))) * bendSide;
      const elbow = { x: m.x - Math.sin(ang) * off, y: m.y + Math.cos(ang) * off };
      return [a, elbow, end];
    };

    const tick = (now: number) => {
      raf = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!anim) return;
      const a = anim;
      const f = frame();
      const t = now - a.t0;

      // How far out from behind the button he is.
      let e: number;
      if (a.hidingAt) {
        const u = clamp01((now - a.hidingAt) / HIDE);
        e = (1 - u) * clamp01((a.hidingAt - a.t0) / EMERGE);
        if (u >= 1) {
          anim = null;
          ctx.clearRect(0, 0, W, H);
          return;
        }
      } else {
        e = outCubic(clamp01(t / EMERGE));
      }
      const aim = a.hidingAt ? 0 : inOut(clamp01((t - EMERGE) / AIM));
      const tShoot = t - EMERGE - AIM;
      const shoot = a.hidingAt ? 0 : outCubic(clamp01(tShoot / SHOOT));
      const tYank = tShoot - SHOOT - HOLD;
      const yank = a.hidingAt ? 0 : inCubic(clamp01(tYank / YANK));

      // Local frame: `o` on the button edge, `out` pointing away from the button, `s` sideways (facing).
      const flatL = f.bx + f.r + 6;
      const flatR = f.bx + f.bw - f.r - 6;
      const ox = flatL + (flatR - flatL) * a.along;
      const oy = a.hang ? f.by + f.bh : f.by;
      const outY = a.hang ? 1 : -1;
      const s = a.side;
      const S = scaleFor(f.bh);
      // the whole figure slides out from behind the edge (everything on the button's side is clipped away)
      const hidden = a.hang ? 76 : 28;
      const slide = -hidden * (1 - e);
      const P = (side: number, out: number): Pt => ({ x: ox + side * s * S, y: oy + (out + slide) * outY * S });

      // Where the drawn cursor is: still, then yanked onto the button next to him.
      const land = { x: ox + s * 6 * S, y: oy - outY * 10 * S };
      const c = {
        x: a.from.x + (land.x - a.from.x) * yank,
        y: a.from.y + (land.y - a.from.y) * yank,
      };
      cur.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;

      // Within reach he leans out toward the cursor (upper body only), and straightens up as he pulls.
      const segArm = ARM * S;
      const [shx, shy] = a.hang ? SHOULDER.hang : SHOULDER.peek;
      const full = { x: ox + shx * s * S, y: oy + shy * outY * S };
      const toFrom = Math.hypot(a.from.x - full.x, a.from.y - full.y) || 1;
      const leanBy = a.grab ? Math.min(LEAN * S, Math.max(0, toFrom - 2 * segArm * 0.95)) * aim * (1 - yank) : 0;
      const lx = ((a.from.x - full.x) / toFrom) * leanBy;
      const ly = ((a.from.y - full.y) / toFrom) * leanBy;
      const U = (side: number, out: number, k = 1): Pt => {
        const q = P(side, out);
        return { x: q.x + lx * k, y: q.y + ly * k };
      };

      // body
      let head: Pt;
      let shoulder: Pt;
      const lines: Pt[][] = [];
      let thread: [Pt, Pt] | null = null;
      // the jerk of the pull: he rocks back for a moment
      const rock = a.hidingAt ? 0 : Math.sin(Math.PI * clamp01(tYank / (YANK + 140)));

      if (a.hang) {
        // upside down on a short thread: feet up, head down, one leg bent like a climber
        const sw = -rock * 7;
        const foot = P(0, 10);
        const hip = U(2 + sw * 0.3, 30, 0.35);
        shoulder = U(3 + sw * 0.8, 48);
        const neck = U(3 + sw * 0.9, 52);
        head = U(3.5 + sw, 60);
        lines.push([foot, P(1, 20), hip]);
        lines.push([hip, P(-13, 23), P(-12, 12)]);
        lines.push([hip, neck]);
        lines.push([shoulder, U(-6 + sw * 0.5, 57), U(-3 + sw * 0.7, 66)]);
        thread = [{ x: ox, y: oy - outY * 4 }, foot];
      } else {
        // peeking over the top: head, shoulders, one hand gripping the edge
        const lw = -rock * 4;
        const neck = U(2 + lw * 0.5, 8);
        head = U(3 + lw, 17);
        shoulder = U(2 + lw * 0.5, 4);
        lines.push([P(0, -30), neck]);
        lines.push([shoulder, U(-10, 7, 0.5), P(-15, 1)]);
      }

      // the arm: from hanging loose to pointing at the cursor; then either it shoots and pulls back,
      // or (within reach) the hand goes all the way out, grabs the cursor and drags it in
      const toC = Math.atan2(c.y - shoulder.y, c.x - shoulder.x);
      const rest = a.hang ? Math.atan2(outY, s * 0.2) : Math.atan2(-outY, -s * 0.3);
      let dAng = toC - rest;
      while (dAng > Math.PI) dAng -= Math.PI * 2;
      while (dAng < -Math.PI) dAng += Math.PI * 2;
      const ang = rest + dAng * aim;
      const toCur = Math.hypot(c.x - shoulder.x, c.y - shoulder.y);
      const reach = a.grab
        ? segArm * 1.35 + (Math.min(toCur, 2 * segArm) - segArm * 1.35) * shoot
        : segArm * (1.35 + 0.6 * aim - 0.9 * yank);
      const shootArm = bone(shoulder, ang, reach, segArm, -s * outY);
      lines.push(shootArm);
      const hand = shootArm[2];

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // web line: shoots from the hand to the cursor, then stays stuck to it
      if (shoot > 0 && !a.grab) {
        const tip = { x: hand.x + (c.x - hand.x) * shoot, y: hand.y + (c.y - hand.y) * shoot };
        ctx.strokeStyle = WEB;
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(hand.x, hand.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
        // a small splat where it sticks
        if (shoot >= 1) {
          ctx.lineWidth = 1.2;
          for (let i = 0; i < 5; i++) {
            const ga = (i / 5) * Math.PI * 2 + 0.4;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x + Math.cos(ga) * 6, c.y + Math.sin(ga) * 6);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // the thread he hangs from
      if (thread) {
        ctx.strokeStyle = WEB;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        limb(thread);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // the figure, only the part that is out past the edge: a thin white rim so he stands clear of
      // the button, then solid ink
      ctx.save();
      ctx.beginPath();
      if (a.hang) ctx.rect(0, oy - 1, W, H);
      else ctx.rect(0, 0, W, oy + 1);
      ctx.clip();
      const hr = 6.5 * S;
      for (const pass of [0, 1]) {
        ctx.strokeStyle = pass ? INK : RIM;
        ctx.fillStyle = pass ? INK : RIM;
        ctx.lineWidth = pass ? 3.4 * S : 3.4 * S + 2.6;
        ctx.beginPath();
        for (const l of lines) limb(l);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(head.x, head.y, hr + (pass ? 0 : 1.3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();

      // the cursor lands: the button jolts and is pressed
      if (yank >= 1 && !a.pressed) {
        a.pressed = true;
        press();
      }
      kick();
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // The drawn cursor clicks, the button sinks in, and the link opens.
    const press = () => {
      // Scale only the arrow, around its tip. Scaling the wrapper would also scale its translate
      // and throw the cursor across the panel for a moment.
      arrowRef.current?.animate([{ scale: "1" }, { scale: "0.85" }, { scale: "1" }], { duration: 200, easing: "ease-out" });
      ring.animate(
        [
          { opacity: 0.9, scale: "0.4" },
          { opacity: 0, scale: "2.4" },
        ],
        { duration: 460, easing: "ease-out" },
      );
      lean.animate([{ scale: "1" }, { scale: "0.92" }, { scale: "1" }], { duration: 260, easing: "ease-out" });
      window.setTimeout(() => {
        lean.querySelector("a")?.click();
        // if the page didn't change, put everything back
        window.setTimeout(() => {
          anim = null;
          showCursor(false);
          kick();
          arm();
        }, 1500);
      }, 160);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // Browsers send a still pointer a move event when the page scrolls under it; that isn't moving.
      const moved = !pointer.known || e.movementX !== 0 || e.movementY !== 0;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.known = true;
      if (moved) {
        retreat();
        if (!anim) arm();
      }
    };
    const onActivity = () => {
      retreat();
      if (pointer.known && !anim) arm();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      pointer.known = false;
      window.clearTimeout(timer);
      retreat();
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
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", onActivity);
      window.removeEventListener("keydown", onActivity);
      document.removeEventListener("pointerout", onOut);
      area.style.cursor = "";
    };
  }, [areaRef, targetRef, leanRef, idleMs]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      {/* the cursor the page draws while the stickman has hold of it */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-30 opacity-0"
      >
        <div ref={ringRef} className="absolute -left-4 -top-4 size-8 rounded-full border-2 border-neutral-900 opacity-0" />
        <svg
          ref={arrowRef}
          width="22"
          height="26"
          viewBox="0 0 22 26"
          className="origin-[1.5px_1.5px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
          <path
            d="M1.5 1.5 L1.5 20.5 L6.6 15.7 L10.2 23.6 L13.6 22.1 L10.1 14.4 L17.2 14.4 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
