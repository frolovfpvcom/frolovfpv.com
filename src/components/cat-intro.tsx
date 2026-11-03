"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/lib/lang";

/* Kat-intro: første gang man kommer ind på siden går katten ind fra venstre på en hvid,
   sløret baggrund. En lille drone flyver rundt om den, katten snurrer rundt efter den,
   bliver svimmel og falder på ryggen. Dronen taber et par goggles ned på den, katten
   springer op og rækker ud efter dronen (logoets positur), og til sidst flyver katten op
   i venstre hjørne, hvor logoet sidder, mens siden kommer frem.

   Alt styres af ét ur i requestAnimationFrame og sættes direkte på SVG'en, så React
   ikke renderer for hver frame. Et lille script i <head> (se layout.tsx) afgør før
   første paint, om intro'en skal vises: én gang pr. fane, aldrig ved "reducer bevægelse",
   og altid med ?intro i adressen. */

const T = {
  walkStart: 0.25,
  walkEnd: 2.6,
  droneIn: 2.0,
  orbit: 3.0,
  orbitFast: 4.5,
  fall: 5.7,
  land: 6.15,
  hover: 5.7,
  hoverEnd: 6.35,
  drop: 6.85,
  dropEnd: 7.3,
  crouch: 7.65,
  jump: 7.85,
  poof: 8.05,
  logoIn: 8.45,
  fly: 9.35,
  flyEnd: 10.35,
  end: 10.45,
};

const CAT_S = 1.3; // the drawn cat's scale in scene units
const LOGO_H = 235; // the logo pose's height in scene units
const LOGO_RATIO = 167 / 227;
const GROUND = 120; // scene y of the floor (scene origin = screen centre)
const FEET = 72; // local y of the drawn cat's paws
const BACK = 35; // local distance from the cat's centre to the floor when it lies on its back
const LIE = 160; // how far it tips over: a bit less than upside down, so the head stays up

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeIn = (p: number) => p * p * p;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const backOut = (p: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

function rotatePt(x: number, y: number, a: number, cx = 0, cy = 0) {
  const c = Math.cos(rad(a));
  const s = Math.sin(rad(a));
  return { x: cx + (x - cx) * c - (y - cy) * s, y: cy + (x - cx) * s + (y - cy) * c };
}

const texts = {
  da: { skip: "Spring over" },
  en: { skip: "Skip" },
};

/** One leg, hanging from its hip or shoulder; rotated by the clock. */
function Leg({ x, y, len, w, far, legRef }: { x: number; y: number; len: number; w: number; far?: boolean; legRef: (el: SVGGElement | null) => void }) {
  const fill = far ? "#e4e4e6" : "#fff";
  return (
    <g transform={`translate(${x} ${y})`}>
      <g ref={legRef}>
        <rect x={-w / 2} y={-8} width={w} height={len + 6} rx={w / 2} fill={fill} />
        <line x1={-w / 2 + 1.5} y1={len * 0.42} x2={w / 2 - 1.5} y2={len * 0.38} strokeWidth={4.5} />
        <line x1={-w / 2 + 1.5} y1={len * 0.62} x2={w / 2 - 1.5} y2={len * 0.58} strokeWidth={4} />
        <ellipse cx={3} cy={len - 1} rx={w / 2 + 3.5} ry={6} fill={fill} />
      </g>
    </g>
  );
}

/** The little quad from Peter's sketch, seen from above: four sketchy prop guards. */
function Drone({ propRefs }: { propRefs: React.MutableRefObject<(SVGGElement | null)[]> }) {
  const motors = [
    [-31, -27],
    [31, -27],
    [-31, 27],
    [31, 27],
  ];
  return (
    <g stroke="#111" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {motors.map(([mx, my], i) => (
        <g key={i}>
          <line x1={Math.sign(mx) * 9} y1={my * 0.5} x2={mx} y2={my} strokeWidth={2.4} />
          <circle cx={mx} cy={my} r={21} fill="rgba(17,17,17,0.05)" strokeWidth={1.8} />
          <circle cx={mx + 0.8} cy={my - 0.6} r={22.2} strokeWidth={1} opacity={0.7} />
          <g transform={`translate(${mx} ${my})`}>
            <g
              ref={(el) => {
                propRefs.current[i] = el;
              }}
            >
              <path d="M-17,-1.6 L17,-1.6 L17,1.6 L-17,1.6 Z" fill="rgba(17,17,17,0.18)" stroke="none" />
              <path
                d="M-2.4,-6.5 Q0,-9 2.4,-6.5 L2.4,-2.4 L6.5,-2.4 Q9,0 6.5,2.4 L2.4,2.4 L2.4,6.5 Q0,9 -2.4,6.5 L-2.4,2.4 L-6.5,2.4 Q-9,0 -6.5,-2.4 L-2.4,-2.4 Z"
                fill="#fff"
                strokeWidth={1.6}
              />
            </g>
          </g>
        </g>
      ))}
      <path
        d="M-9,-36 Q-10,-38 -6,-39 L-3,-39 L-3,-34 L3,-34 L3,-39 L6,-39 Q10,-38 9,-36 L9,-16 Q12,-12 10,-8 L10,8 Q12,12 9,16 L9,36 Q10,38 6,39 L3,39 L3,36 L-3,36 L-3,39 L-6,39 Q-10,38 -9,36 L-9,16 Q-12,12 -10,8 L-10,-8 Q-12,-12 -9,-16 Z"
        fill="#fff"
        strokeWidth={2}
      />
    </g>
  );
}

/** The goggles from the logo: a black visor with a strap and two antennas. */
function Goggles() {
  return (
    <g>
      <path d="M61,-44 L39,-47" stroke="#111" strokeWidth={7} strokeLinecap="round" />
      <rect x={61} y={-73} width={5.5} height={20} rx={2} fill="#111" transform="rotate(-16 64 -56)" />
      <rect x={80} y={-71} width={5.5} height={18} rx={2} fill="#111" transform="rotate(14 83 -56)" />
      <rect x={59} y={-54} width={36} height={24} rx={9} fill="#111" />
      <path d="M66,-48 Q76,-51 88,-48" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
      <circle cx={68} cy={-37} r={1.6} fill="#fff" />
      <circle cx={73} cy={-37} r={1.6} fill="#fff" />
    </g>
  );
}

export function CatIntro() {
  const [active, setActive] = useState(true);
  const t = useT(texts);
  const clipId = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const world = useRef<SVGGElement>(null);
  const cat = useRef<SVGGElement>(null);
  const catBody = useRef<SVGGElement>(null);
  const head = useRef<SVGGElement>(null);
  const goggles = useRef<SVGGElement>(null);
  const tail = useRef<SVGPathElement[]>([]);
  const tailTip = useRef<SVGCircleElement>(null);
  const legs = useRef<(SVGGElement | null)[]>([]);
  const shadow = useRef<SVGEllipseElement>(null);
  const droneBack = useRef<SVGGElement>(null);
  const droneFront = useRef<SVGGElement>(null);
  const drone = useRef<SVGGElement>(null);
  const props = useRef<(SVGGElement | null)[]>([]);
  const dropGoggles = useRef<SVGGElement>(null);
  const stars = useRef<(SVGPathElement | null)[]>([]);
  const puffs = useRef<(SVGCircleElement | null)[]>([]);
  const logo = useRef<HTMLImageElement>(null);
  const skipAt = useRef<number | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") {
      setActive(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let raf = 0;
    let start = -1;
    let last = 0;
    let face = 1; // -1..1, the cat's facing (scaleX); passes through 0 when it turns
    let fallFace = 1;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      delete html.dataset.intro;
      document.body.style.overflow = prevOverflow;
      setActive(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipAt.current ??= performance.now();
    };
    window.addEventListener("keydown", onKey);

    const set = (el: Element | null | undefined, attr: string, v: string | number) => el?.setAttribute(attr, String(v));

    const frame = (now: number) => {
      if (start < 0) {
        start = now;
        last = now;
        if (cat.current) cat.current.style.visibility = "visible";
      }
      const time = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Skipping: fade everything out quickly and hand over to the page.
      if (skipAt.current !== null) {
        const p = seg(now, skipAt.current, skipAt.current + 350);
        if (root.current) root.current.style.opacity = String(1 - p);
        if (p >= 1) return finish();
        raf = requestAnimationFrame(frame);
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const k = clamp(Math.min(vw / 900, vh / 620), 0.6, 1.3); // px per scene unit
      const halfW = vw / 2 / k;
      const halfH = vh / 2 / k;
      const toPx = (x: number, y: number) => ({ x: vw / 2 + x * k, y: vh / 2 + y * k });
      set(world.current, "transform", `translate(${vw / 2} ${vh / 2}) scale(${k})`);

      /* ---------- the drone ---------- */
      const standY = GROUND - FEET * CAT_S;
      const orbitCy = standY - 34;
      let dx: number, dy: number, depth = 0, dScale = 0.62, tilt = 0;
      const orbitAngle = (tt: number) => {
        const slow = seg(tt, T.orbit, T.orbitFast);
        const fast = seg(tt, T.orbitFast, T.fall);
        return 2 * Math.PI * (slow * 1.25) + 2 * Math.PI * (fast * fast * 2.6 + fast * 0.4);
      };
      const orbitPos = (tt: number) => {
        const a = orbitAngle(tt);
        const tight = seg(tt, T.orbitFast, T.fall);
        const rx = lerp(200, 140, tight);
        const ry = lerp(52, 40, tight);
        return { x: rx * Math.cos(a), y: orbitCy + ry * Math.sin(a), d: Math.sin(a) };
      };
      const hoverAbove = { x: 10, y: GROUND - 230 };
      const logoW = LOGO_H * LOGO_RATIO;
      const logoLeft = -logoW / 2;
      const logoTop = GROUND - LOGO_H;
      const pawPt = { x: logoLeft + logoW * 0.8, y: logoTop - 46 };

      if (time < T.orbit) {
        const p = easeOut(seg(time, T.droneIn, T.orbit));
        const o = orbitPos(T.orbit);
        dx = lerp(halfW + 120, o.x, p);
        dy = lerp(-halfH - 80, o.y, p);
        tilt = lerp(-22, 0, p);
        dScale = lerp(0.5, 0.62, p);
      } else if (time < T.fall) {
        const o = orbitPos(time);
        dx = o.x;
        dy = o.y;
        depth = o.d;
        const o2 = orbitPos(time + 0.02);
        tilt = clamp((o2.x - o.x) * 0.9, -26, 26);
        dScale = 0.62 * (1 + 0.16 * depth);
      } else if (time < T.jump) {
        const o = orbitPos(T.fall);
        const p = easeInOut(seg(time, T.hover, T.hoverEnd));
        dx = lerp(o.x, hoverAbove.x, p) + Math.sin(time * 2.4) * 6 * p;
        dy = lerp(o.y, hoverAbove.y, p) + Math.sin(time * 3.1) * 5 * p;
        depth = lerp(o.d, 0, p);
        tilt = Math.sin(time * 2.4) * 5 * p;
        dScale = 0.62 * (1 + 0.16 * depth);
      } else if (time < T.fly) {
        const p = easeInOut(seg(time, T.jump, T.logoIn));
        dx = lerp(hoverAbove.x, pawPt.x, p) + Math.sin(time * 2.2) * 5;
        dy = lerp(hoverAbove.y, pawPt.y, p) + Math.sin(time * 3.3) * 6;
        tilt = Math.sin(time * 2.2) * 6;
      } else {
        const p = easeIn(seg(time, T.fly, T.fly + 0.8));
        dx = lerp(pawPt.x, halfW + 140, p);
        dy = lerp(pawPt.y, -halfH - 120, p);
        tilt = lerp(0, 24, p);
      }
      const front = depth > 0;
      const wantParent = front ? droneFront.current : droneBack.current;
      if (drone.current && wantParent && drone.current.parentNode !== wantParent) wantParent.appendChild(drone.current);
      set(drone.current, "transform", `translate(${dx} ${dy}) rotate(${tilt}) scale(${dScale} ${dScale * 0.6})`);
      props.current.forEach((el, i) => set(el, "transform", `rotate(${(time * 2900 * (i % 3 === 0 ? 1 : -1)) % 360})`));

      /* ---------- the cat ---------- */
      const startX = -halfW - 140;
      const wp = seg(time, T.walkStart, T.walkEnd);
      const walkF = (p: number) => 1 - (1 - p) * (1 - p);
      const catX = lerp(startX, 0, walkF(wp));
      const speed = wp > 0 && wp < 1 ? 2 * (1 - wp) : 0;
      const phase = ((catX - startX) / 78) * Math.PI;
      let catY = standY;
      let rot = 0;
      let squashY = 1;
      let catOpacity = 1;
      const legA = [0, 0, 0, 0]; // far hind, far front, near hind, near front
      let bob = 0;
      let tailSway = Math.sin(time * 2.6) * 10;

      if (time < T.orbit) {
        const amp = 30 * clamp(speed * 1.2);
        legA[0] = Math.sin(phase) * amp;
        legA[3] = Math.sin(phase) * amp;
        legA[1] = Math.sin(phase + Math.PI) * amp;
        legA[2] = Math.sin(phase + Math.PI) * amp;
        bob = -Math.abs(Math.sin(phase)) * 3.5 * clamp(speed);
        face = 1;
      }
      if (time >= T.orbit && time < T.fall) {
        // Turn after the drone; in the fast laps the turns get frantic.
        const target = dx >= 0 ? 1 : -1;
        const turnRate = time < T.orbitFast ? 9 : 22;
        const before = face;
        face += (target - face) * Math.min(1, dt * turnRate);
        const turning = Math.abs(face - before) / Math.max(dt, 0.001);
        const paddle = clamp(turning / 8) * 18 + (time > T.orbitFast ? 10 * seg(time, T.orbitFast, T.fall) : 0);
        legA[0] = Math.sin(time * 22) * paddle;
        legA[3] = Math.sin(time * 22) * paddle;
        legA[1] = -Math.sin(time * 22) * paddle;
        legA[2] = -Math.sin(time * 22) * paddle;
        bob = -Math.abs(Math.sin(time * 11)) * 3 * clamp(paddle / 10);
        fallFace = face >= 0 ? 1 : -1;
      }
      if (time >= T.fall) {
        // Dizzy: wobble, tip over backwards and land on the back.
        if (time < T.jump) {
          const wob = seg(time, T.fall, T.fall + 0.18);
          face += (fallFace - face) * Math.min(1, dt * 20);
          const p = easeIn(seg(time, T.fall + 0.12, T.land));
          rot = -fallFace * (Math.sin(wob * Math.PI) * 10 + LIE * p);
          const restY = GROUND - BACK * CAT_S - 2;
          catY = lerp(standY, restY, p) - Math.sin(p * Math.PI) * 26;
          const b = seg(time, T.land, T.land + 0.3);
          catY -= Math.sin(b * Math.PI) * 9 * (1 - b);
          squashY = 1 - Math.sin(b * Math.PI) * 0.08;
          // Legs pedal in the air, faster when the goggles land.
          const kick = time > T.land ? 1 : 0;
          const excite = time > T.dropEnd ? 1.6 : 1;
          for (let i = 0; i < 4; i++) legA[i] = kick * Math.sin(time * 9 * excite + i * 1.7) * 22;
          tailSway = Math.sin(time * 6) * 14;
          // Crouch and spring up.
          const c = seg(time, T.crouch, T.jump);
          squashY *= 1 - Math.sin(c * Math.PI * 0.5) * 0.1;
        } else {
          const p = seg(time, T.jump, T.poof + 0.06);
          const restY = GROUND - BACK * CAT_S - 2;
          rot = -fallFace * lerp(LIE, 360, easeOut(p));
          catY = restY - Math.sin(p * Math.PI * 0.8) * 120;
          catOpacity = 1 - seg(time, T.poof - 0.04, T.poof + 0.06);
          for (let i = 0; i < 4; i++) legA[i] = -20;
        }
      }

      set(cat.current, "transform", `translate(${catX} ${catY}) rotate(${rot}) scale(${face * CAT_S} ${CAT_S * squashY})`);
      set(cat.current, "opacity", catOpacity);
      set(catBody.current, "transform", `translate(0 ${bob})`);
      legs.current.forEach((el, i) => set(el, "transform", `rotate(${legA[i]})`));

      // Tail: three stacked strokes (outline, fill, stripes) and a black tip.
      const tx = -84 + tailSway * 0.6;
      const ty = -56 + Math.abs(tailSway) * 0.3;
      const d = `M-46,-6 C-70,${-6 + tailSway * 0.25} ${-90 + tailSway},-24 ${tx},${ty}`;
      tail.current.forEach((el) => set(el, "d", d));
      set(tailTip.current, "cx", tx);
      set(tailTip.current, "cy", ty);

      // Head follows the drone (worked out in the cat's own coordinates).
      const neck = { x: 40, y: -16 };
      const rel = rotatePt(dx - catX, dy - catY, -rot);
      const lx = rel.x / (Math.abs(face) < 0.05 ? 0.05 * Math.sign(face || 1) : face) / CAT_S;
      const ly = rel.y / CAT_S;
      const look = deg(Math.atan2(ly - neck.y, Math.max(lx - neck.x, 30)));
      const headRot = time < T.droneIn + 0.5 ? Math.sin(phase) * 2 : clamp(look * 0.8, -42, 22);
      set(head.current, "transform", `rotate(${headRot} ${neck.x} ${neck.y})`);

      // Goggles: dropped from the drone, they land on the face with a little pop.
      const gogglesOn = time >= T.dropEnd;
      const gp = seg(time, T.dropEnd, T.dropEnd + 0.25);
      if (goggles.current) {
        goggles.current.style.display = gogglesOn ? "" : "none";
        set(goggles.current, "transform", `translate(76 -42) scale(${gogglesOn ? 1 + Math.sin(gp * Math.PI) * 0.25 : 1}) translate(-76 42)`);
      }
      const gLocal = rotatePt(76, -42, headRot, neck.x, neck.y);
      const gScene = rotatePt(gLocal.x * face * CAT_S, gLocal.y * CAT_S, rot);
      const gx = catX + gScene.x;
      const gy = catY + gScene.y;
      if (dropGoggles.current) {
        const showDrop = time >= T.drop && time < T.dropEnd;
        dropGoggles.current.style.display = showDrop ? "" : "none";
        if (showDrop) {
          // Same chain of transforms as the goggles on the head, plus an offset from the
          // drone that shrinks to nothing, so they land exactly in place.
          const p = seg(time, T.drop, T.dropEnd);
          const fallP = easeIn(p);
          const ox = (dx - gx) * (1 - p);
          const oy = (dy + 12 - gy) * (1 - fallP);
          const spin = (1 - p) * fallFace * 200 + Math.sin(p * 10) * 12 * (1 - p);
          const sc = lerp(0.55, 1, p);
          set(
            dropGoggles.current,
            "transform",
            `translate(${ox} ${oy}) translate(${catX} ${catY}) rotate(${rot}) scale(${face * CAT_S} ${CAT_S * squashY}) translate(0 ${bob}) rotate(${headRot} ${neck.x} ${neck.y}) rotate(${spin} 76 -42) translate(76 -42) scale(${sc}) translate(-76 42)`,
          );
        }
      }

      // The cat's shadow on the floor.
      const shadowW = time < T.poof ? 70 : 44;
      set(shadow.current, "cx", time < T.poof ? catX : 0);
      set(shadow.current, "rx", shadowW * (time >= T.jump && time < T.poof ? 0.7 : 1));
      set(shadow.current, "opacity", time < T.poof ? 0.14 * catOpacity + (1 - catOpacity) * 0.12 : 0.12 * (1 - seg(time, T.fly, T.fly + 0.4)));

      // Dizzy stars circle the head while it lies on its back.
      const sp = seg(time, T.land, T.dropEnd);
      stars.current.forEach((el, i) => {
        if (!el) return;
        const vis = sp > 0 && sp < 1;
        el.style.display = vis ? "" : "none";
        if (!vis) return;
        const a = time * 5 + (i * Math.PI * 2) / 3;
        const hx = catX + rotatePt(64 * face * CAT_S, -40 * CAT_S, rot).x;
        const hy = catY + rotatePt(64 * face * CAT_S, -40 * CAT_S, rot).y;
        const fade = Math.sin(sp * Math.PI);
        set(el, "transform", `translate(${hx + Math.cos(a) * 46} ${hy - 28 + Math.sin(a) * 12}) rotate(${time * 200}) scale(${fade})`);
      });

      // Little white-grey puffs: landing on the back, goggles on, and the jump.
      const puffAt = (i0: number, t0: number, x: number, y: number, big = 1) => {
        for (let j = 0; j < 4; j++) {
          const el = puffs.current[i0 + j];
          if (!el) continue;
          const p = seg(time, t0, t0 + 0.55);
          const on = p > 0 && p < 1;
          el.style.display = on ? "" : "none";
          if (!on) continue;
          const a = rad(-160 + j * 46);
          const r = easeOut(p) * 60 * big;
          set(el, "cx", x + Math.cos(a) * r);
          set(el, "cy", y + Math.sin(a) * r * 0.45);
          set(el, "r", (9 + 6 * j % 3) * big * (1 - p * 0.6));
          set(el, "opacity", 0.55 * (1 - p));
        }
      };
      puffAt(0, T.land, catX, GROUND - 6, 1.1);
      puffAt(4, T.dropEnd, gx, gy, 0.6);
      puffAt(8, T.poof - 0.02, 0, GROUND - 6, 1.3);

      /* ---------- the logo pose, then the flight to the corner ---------- */
      if (logo.current) {
        const lp = seg(time, T.poof, T.logoIn);
        const visible = time >= T.poof;
        logo.current.style.visibility = visible ? "visible" : "hidden";
        if (visible) {
          const tl = toPx(logoLeft, logoTop);
          const w = logoW * k;
          const h = LOGO_H * k;
          let x = tl.x;
          let y = tl.y;
          let s = lerp(0.55, 1, backOut(lp));
          let r = Math.sin(time * 4) * 1.8 * seg(time, T.logoIn, T.logoIn + 0.3);
          y -= (1 - easeOut(lp)) * 50 * k;
          const navEl = document.querySelector<HTMLElement>("[data-nav-logo]");
          if (time >= T.fly && navEl) {
            const n = navEl.getBoundingClientRect();
            const p = easeInOut(seg(time, T.fly, T.flyEnd));
            x = lerp(tl.x, n.left, p);
            y = lerp(tl.y, n.top, p) - Math.sin(p * Math.PI) * 60;
            s = lerp(1, n.height / h, p);
            r = lerp(r, 0, p);
          }
          logo.current.style.width = `${w}px`;
          logo.current.style.height = `${h}px`;
          logo.current.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;
          logo.current.style.transformOrigin = time >= T.fly ? "0 0" : "50% 100%";
        }
      }

      // The white veil and the drawn scene fade away as the cat flies home.
      const fade = seg(time, T.fly + 0.25, T.flyEnd);
      if (bg.current) bg.current.style.opacity = String(1 - fade);
      if (svg.current) svg.current.style.opacity = String(1 - fade);
      if (root.current) root.current.style.pointerEvents = time > T.fly ? "none" : "";

      if (time >= T.end) return finish();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!active) return null;

  const outline = { stroke: "#111", strokeWidth: 3.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const torso = "M-52,0 C-52,-22 -30,-28 0,-27 C30,-26 48,-25 53,-7 C57,11 40,26 10,26 C-20,27 -52,22 -52,0 Z";

  return (
    <div ref={root} className="cat-intro fixed inset-0 z-[100]" aria-hidden="false">
      <div ref={bg} className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.95), rgba(244,244,246,0.9))", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
      <svg ref={svg} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <clipPath id={`${clipId}-torso`}>
            <path d={torso} />
          </clipPath>
        </defs>
        <g ref={world}>
          <ellipse ref={shadow} cx={-2000} cy={GROUND + 2} rx={70} ry={9} fill="#111" opacity={0.14} />
          <g ref={droneBack} />
          <g ref={cat} style={{ visibility: "hidden" }} transform="translate(-5000 0)">
            <g ref={catBody} {...outline}>
              {/* far legs */}
              <Leg x={-38} y={6} len={64} w={17} far legRef={(el) => (legs.current[0] = el)} />
              <Leg x={24} y={8} len={62} w={15} far legRef={(el) => (legs.current[1] = el)} />
              {/* tail */}
              <path ref={(el) => { if (el) tail.current[0] = el; }} fill="none" stroke="#111" strokeWidth={16} />
              <path ref={(el) => { if (el) tail.current[1] = el; }} fill="none" stroke="#fff" strokeWidth={9.5} />
              <path ref={(el) => { if (el) tail.current[2] = el; }} fill="none" stroke="#111" strokeWidth={9.5} strokeDasharray="5 8" strokeLinecap="butt" />
              <circle ref={tailTip} r={7.6} fill="#111" stroke="none" />
              {/* near legs */}
              <Leg x={-30} y={8} len={64} w={17} legRef={(el) => (legs.current[2] = el)} />
              <Leg x={33} y={10} len={62} w={15} legRef={(el) => (legs.current[3] = el)} />
              {/* torso with tiger stripes */}
              <path d={torso} fill="#fff" />
              <g clipPath={`url(#${clipId}-torso)`} fill="#111" stroke="none">
                {[-40, -24, -8, 8, 24].map((x, i) => (
                  <path key={x} d={`M${x - 5},-30 Q${x + 3},-12 ${x - 3},${6 + (i % 2) * 5} Q${x + 9},-12 ${x + 6},-30 Z`} />
                ))}
                <path d="M-52,-4 Q-40,0 -36,8 Q-46,6 -52,8 Z" />
              </g>
              <path d={torso} fill="none" />
              {/* head */}
              <g ref={head}>
                <path d="M42,-50 L38,-82 L60,-62 Z" fill="#fff" />
                <path d="M66,-62 L84,-84 L88,-52 Z" fill="#fff" />
                <path d="M44,-58 L42,-74 L52,-63" fill="none" strokeWidth={1.6} />
                <path d="M38,-40 C38,-58 52,-65 64,-65 C79,-65 91,-56 91,-40 C91,-26 81,-17 64,-17 C50,-17 38,-24 38,-40 Z" fill="#fff" />
                <g fill="#111" stroke="none">
                  <path d="M55,-64 Q59,-55 55,-48 Q63,-56 61,-64 Z" />
                  <path d="M66,-65 Q69,-56 65,-50 Q73,-57 71,-64 Z" />
                  <path d="M41,-31 Q49,-33 55,-28 Q47,-27 42,-25 Z" />
                  <ellipse cx={78} cy={-43} rx={3.8} ry={5.2} />
                  <path d="M88,-37 L93.5,-37 L91,-33.5 Z" />
                </g>
                <circle cx={79.4} cy={-45} r={1.3} fill="#fff" stroke="none" />
                <path d="M91,-33 Q89.5,-29 85,-30" fill="none" strokeWidth={1.8} />
                <path d="M84,-31 L105,-35 M84,-28.5 L105,-27" fill="none" strokeWidth={1.3} />
                <g ref={goggles} style={{ display: "none" }}>
                  <Goggles />
                </g>
              </g>
            </g>
          </g>
          <g ref={dropGoggles} style={{ display: "none" }}>
            <Goggles />
          </g>
          <g ref={droneFront}>
            <g ref={drone} transform="translate(-5000 0)">
              <Drone propRefs={props} />
            </g>
          </g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              ref={(el) => {
                stars.current[i] = el;
              }}
              style={{ display: "none" }}
              d="M0,-9 L2.6,-2.8 L9,-2.6 L4,1.6 L5.6,8 L0,4.4 L-5.6,8 L-4,1.6 L-9,-2.6 L-2.6,-2.8 Z"
              fill={i === 1 ? "#8a1e50" : "#0e6e72"}
            />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              ref={(el) => {
                puffs.current[i] = el;
              }}
              style={{ display: "none" }}
              fill="#d8d8dc"
            />
          ))}
        </g>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={logo} src="/images/kat-logo-tiger.svg" alt="" className="pointer-events-none fixed top-0 left-0 max-w-none" style={{ visibility: "hidden" }} />
      <button
        type="button"
        onClick={() => (skipAt.current ??= performance.now())}
        className="absolute right-5 bottom-5 rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-800 backdrop-blur transition-colors hover:bg-white"
      >
        {t.skip}
      </button>
    </div>
  );
}
