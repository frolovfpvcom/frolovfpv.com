"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/lang";

/* Kat-intro i 3D: første gang man kommer ind på siden går katten (logoet som en figur
   med tykkelse) ind fra venstre på en hvid, sløret baggrund. En lille drone flyver rundt om
   den, foran og bagved, og katten vender sig efter den, til den snurrer rundt, bliver
   svimmel og falder på ryggen. Den springer op med en rulle, rækker ud efter dronen og
   flyver til sidst op i venstre hjørne, hvor logoet sidder, mens siden kommer frem.
   Bevægelserne er de samme som i den første, tegnede version.

   Figuren er logoet stablet i 16 lag langs Z-aksen (0 til -20px, de bagerste mørkere),
   så den har en rigtig kant, når den drejer. Det er den samme 3D-figur hele vejen, også
   når den til sidst flyver op på logoets plads i menuen.
   Alt styres af ét ur i requestAnimationFrame og sættes direkte på elementerne, så React
   ikke renderer for hver frame. Et lille script i <head> (se layout.tsx) afgør før første
   paint, om intro'en skal vises: én gang pr. fane, aldrig ved "reducer bevægelse", og
   altid med ?intro i adressen. */

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
  crouch: 7.65,
  jump: 7.85,
  landUp: 8.45,
  fly: 9.35,
  flyEnd: 10.35,
  end: 10.45,
};

const LOGO_H = 235; // the cat's height in scene units
const LOGO_RATIO = 167 / 227;
const GROUND = 120; // scene y of the floor (scene origin = screen centre)
const LAYERS = 16; // copies of the logo stacked along Z give the figure its thickness
const DEPTH = 20; // px from the front layer (0) to the back layer (-20px)
const PERSPECTIVE = 1000; // px
const ORIGIN_Y = 0.25; // the eye sits a bit above the cat, so we look down at the floor
const LIE = 160; // how far it rolls over when it falls on its back
// The logo's outline (convex hull, 0..1), to find how low it reaches when it lies down.
const HULL = [[0.018, 0.398], [0.138, 0.186], [0.175, 0.141], [0.488, 0.02], [0.821, 0.101], [0.868, 0.129], [0.88, 0.165], [0.706, 0.833], [0.536, 0.986], [0.184, 0.884], [0.16, 0.857], [0.03, 0.456]];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeIn = (p: number) => p * p * p;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const rad = (d: number) => (d * Math.PI) / 180;

type V3 = { x: number; y: number; z: number };

const texts = {
  da: { skip: "Spring over" },
  en: { skip: "Skip" },
};

/** The little quad from Peter's sketch, seen from above: four sketchy prop guards. */
function Drone({ propRefs }: { propRefs: React.MutableRefObject<(SVGGElement | null)[]> }) {
  const motors = [
    [-31, -27],
    [31, -27],
    [-31, 27],
    [31, 27],
  ];
  return (
    <svg viewBox="-56 -52 112 104" className="h-full w-full overflow-visible">
      <g stroke="#111" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {motors.map(([mx, my], i) => (
          <g key={i}>
            <line x1={Math.sign(mx) * 9} y1={my * 0.5} x2={mx} y2={my} strokeWidth={2.6} />
            <circle cx={mx} cy={my} r={21} fill="rgba(255,255,255,0.75)" strokeWidth={2} />
            <circle cx={mx + 0.8} cy={my - 0.6} r={22.2} strokeWidth={1.1} opacity={0.7} />
            <g transform={`translate(${mx} ${my})`}>
              <g
                ref={(el) => {
                  propRefs.current[i] = el;
                }}
              >
                <path d="M-17,-1.6 L17,-1.6 L17,1.6 L-17,1.6 Z" fill="rgba(17,17,17,0.2)" stroke="none" />
                <path
                  d="M-2.4,-6.5 Q0,-9 2.4,-6.5 L2.4,-2.4 L6.5,-2.4 Q9,0 6.5,2.4 L2.4,2.4 L2.4,6.5 Q0,9 -2.4,6.5 L-2.4,2.4 L-6.5,2.4 Q-9,0 -6.5,-2.4 L-2.4,-2.4 Z"
                  fill="#fff"
                  strokeWidth={1.7}
                />
              </g>
            </g>
          </g>
        ))}
        <path
          d="M-9,-36 Q-10,-38 -6,-39 L-3,-39 L-3,-34 L3,-34 L3,-39 L6,-39 Q10,-38 9,-36 L9,-16 Q12,-12 10,-8 L10,8 Q12,12 9,16 L9,36 Q10,38 6,39 L3,39 L3,36 L-3,36 L-3,39 L-6,39 Q-10,38 -9,36 L-9,16 Q-12,12 -10,8 L-10,-8 Q-12,-12 -9,-16 Z"
          fill="#fff"
          strokeWidth={2.2}
        />
      </g>
    </svg>
  );
}

export function CatIntro() {
  const [active, setActive] = useState(true);
  const t = useT(texts);
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLImageElement | null)[]>([]);
  const shadow = useRef<HTMLDivElement>(null);
  const drone = useRef<HTMLDivElement>(null);
  const props = useRef<(SVGGElement | null)[]>([]);
  const overlay = useRef<SVGSVGElement>(null);
  const stars = useRef<(SVGPathElement | null)[]>([]);
  const puffs = useRef<(SVGCircleElement | null)[]>([]);
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
    let face = 1; // -1..1: which way the cat is turned; passes 0 (edge-on) as it turns
    let fallFace = 1;
    let fallTurn = 35;
    let tiltX = 0; // smoothed tilt back/forward toward the drone (deg)
    let lastK = 0;
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
      const W = LOGO_H * LOGO_RATIO;
      const H = LOGO_H;

      // Sizes only change on resize.
      if (k !== lastK) {
        lastK = k;
        if (cat.current) {
          Object.assign(cat.current.style, { width: `${W * k}px`, height: `${H * k}px`, left: `${(-W * k) / 2}px`, top: `${-H * k}px` });
        }
        layers.current.forEach((el, i) => {
          if (el) el.style.transform = `translateZ(${(-i * DEPTH) / (LAYERS - 1)}px)`;
        });
        if (drone.current) {
          const dw = 96 * k;
          Object.assign(drone.current.style, { width: `${dw}px`, height: `${dw * 0.93}px`, left: `${-dw / 2}px`, top: `${(-dw * 0.93) / 2}px` });
        }
        if (shadow.current) {
          const sw = W * 0.75 * k;
          Object.assign(shadow.current.style, { width: `${sw}px`, height: `${sw}px`, left: `${-sw / 2}px`, top: `${-sw / 2}px` });
        }
        if (scene.current) {
          scene.current.style.perspective = `${PERSPECTIVE}px`;
          scene.current.style.perspectiveOrigin = `50% ${ORIGIN_Y * 100}%`;
        }
      }

      // Screen position of a point in the 3D scene (scene units, origin = screen centre).
      const project = (p: V3) => {
        const ox = vw / 2;
        const oy = vh * ORIGIN_Y;
        const sx = vw / 2 + p.x * k;
        const sy = vh / 2 + p.y * k;
        const f = PERSPECTIVE / (PERSPECTIVE - p.z * k);
        return { x: ox + (sx - ox) * f, y: oy + (sy - oy) * f, f };
      };

      /* ---------- the drone (same path as the first version, now in 3D) ---------- */
      const standCy = GROUND - H / 2;
      const orbitCy = standCy - 10;
      const orbitAngle = (tt: number) => {
        const slow = seg(tt, T.orbit, T.orbitFast);
        const fast = seg(tt, T.orbitFast, T.fall);
        return 2 * Math.PI * (slow * 1.25) + 2 * Math.PI * (fast * fast * 2.6 + fast * 0.4);
      };
      const orbitPos = (tt: number): V3 => {
        const a = orbitAngle(tt);
        const tight = seg(tt, T.orbitFast, T.fall);
        const rx = lerp(210, 150, tight);
        const ry = lerp(52, 40, tight);
        const rz = lerp(190, 140, tight);
        return { x: rx * Math.cos(a), y: orbitCy + ry * Math.sin(a), z: rz * Math.sin(a) };
      };
      const hoverAbove: V3 = { x: 10, y: GROUND - 300, z: 0 };
      const pawPt: V3 = { x: -W / 2 + W * 0.8, y: GROUND - H - 46, z: 0 };

      let d: V3;
      let bank = 0;
      if (time < T.orbit) {
        const p = easeOut(seg(time, T.droneIn, T.orbit));
        const o = orbitPos(T.orbit);
        d = { x: lerp(halfW + 120, o.x, p), y: lerp(-halfH - 80, o.y, p), z: lerp(-150, o.z, p) };
        bank = lerp(-22, 0, p);
      } else if (time < T.fall) {
        d = orbitPos(time);
        bank = clamp((orbitPos(time + 0.02).x - d.x) * 0.9, -26, 26);
      } else if (time < T.jump) {
        const o = orbitPos(T.fall);
        const p = easeInOut(seg(time, T.hover, T.hoverEnd));
        d = {
          x: lerp(o.x, hoverAbove.x, p) + Math.sin(time * 2.4) * 6 * p,
          y: lerp(o.y, hoverAbove.y, p) + Math.sin(time * 3.1) * 5 * p,
          z: lerp(o.z, hoverAbove.z, p),
        };
        bank = Math.sin(time * 2.4) * 5 * p;
      } else if (time < T.fly) {
        const p = easeInOut(seg(time, T.jump, T.landUp));
        d = {
          x: lerp(hoverAbove.x, pawPt.x, p) + Math.sin(time * 2.2) * 5,
          y: lerp(hoverAbove.y, pawPt.y, p) + Math.sin(time * 3.3) * 6,
          z: 0,
        };
        bank = Math.sin(time * 2.2) * 6;
      } else {
        const p = easeIn(seg(time, T.fly, T.fly + 0.8));
        d = { x: lerp(pawPt.x, halfW + 140, p), y: lerp(pawPt.y, -halfH - 120, p), z: 0 };
        bank = lerp(0, 24, p);
      }
      if (drone.current) {
        drone.current.style.transform = `translate3d(${d.x * k}px, ${d.y * k}px, ${d.z * k}px) rotateY(180deg) rotateX(62deg) rotateZ(${bank}deg)`;
      }
      props.current.forEach((el, i) => set(el, "transform", `rotate(${(time * 2900 * (i % 3 === 0 ? 1 : -1)) % 360})`));

      /* ---------- the cat (the first version's moves, on the 3D figure) ---------- */
      // Facing: +1 = turned toward the right, -1 = toward the left. In between it turns
      // around in 3D, edge-on at 0, just like the first version flipped its drawing.
      const turnOf = (f: number) => 35 + (110 * Math.acos(clamp(f, -1, 1))) / Math.PI;
      // How far below its centre the figure reaches, for a given turn and tilt.
      const lowest = (ryDeg: number, rotDeg: number) => {
        const cy = Math.cos(rad(ryDeg));
        const s = Math.sin(rad(rotDeg));
        const c = Math.cos(rad(rotDeg));
        return Math.max(...HULL.map(([u, v]) => (u - 0.5) * W * cy * s + (v - 0.5) * H * c));
      };

      const startX = -halfW - W;
      const wp = seg(time, T.walkStart, T.walkEnd);
      const walkF = (p: number) => 1 - (1 - p) * (1 - p);
      const x = lerp(startX, 0, walkF(wp));
      const speed = wp > 0 && wp < 1 ? 2 * (1 - wp) : 0;
      const phase = ((x - startX) / 78) * Math.PI;
      let cy = standCy;
      let rot = 0;
      let ry = turnOf(face);
      let sx = 1;
      let sy = 1;

      if (time < T.orbit) {
        // Walks in from the left with a little hop and waddle in every step.
        const moving = clamp(speed * 1.2);
        face = 1;
        ry = turnOf(face);
        const hop = Math.abs(Math.sin(phase));
        cy -= hop * 14 * moving;
        rot = Math.sin(phase) * 4 * moving;
        sy = 1 - Math.pow(1 - hop, 6) * 0.05 * moving;
        sx = 1 + (1 - sy) * 0.6;
      } else if (time < T.fall) {
        // Turns after the drone; in the fast laps the turns get frantic.
        const target = d.x >= 0 ? 1 : -1;
        const turnRate = time < T.orbitFast ? 9 : 22;
        const before = face;
        face += (target - face) * Math.min(1, dt * turnRate);
        const turning = Math.abs(face - before) / Math.max(dt, 0.001);
        const paddle = clamp(turning / 8) + (time > T.orbitFast ? seg(time, T.orbitFast, T.fall) : 0);
        cy -= Math.abs(Math.sin(time * 11)) * 6 * clamp(paddle);
        ry = turnOf(face);
        fallFace = face >= 0 ? 1 : -1;
        fallTurn = turnOf(fallFace);
      } else if (time < T.jump) {
        // Dizzy: wobble, tip over backwards and land on its back.
        const wob = seg(time, T.fall, T.fall + 0.18);
        face += (fallFace - face) * Math.min(1, dt * 20);
        ry = turnOf(face);
        const p = easeIn(seg(time, T.fall + 0.12, T.land));
        rot = -fallFace * (Math.sin(wob * Math.PI) * 10 + LIE * p);
        const restCy = GROUND - lowest(fallTurn, -fallFace * LIE) - 2;
        cy = lerp(standCy, restCy, p) - Math.sin(p * Math.PI) * 26;
        const b = seg(time, T.land, T.land + 0.3);
        cy -= Math.sin(b * Math.PI) * 9 * (1 - b);
        sy = 1 - Math.sin(b * Math.PI) * 0.08;
        // Wriggling on its back, then a crouch before it springs up.
        if (time > T.land) rot += Math.sin(time * 11) * 3.5 * seg(time, T.land + 0.15, T.land + 0.4);
        const c = seg(time, T.crouch, T.jump);
        sy *= 1 - Math.sin(c * Math.PI * 0.5) * 0.1;
      } else {
        // Springs up with a roll and lands reaching for the drone.
        const p = seg(time, T.jump, T.landUp);
        const restCy = GROUND - lowest(fallTurn, -fallFace * LIE) - 2;
        rot = -fallFace * lerp(LIE, 360, easeOut(p));
        cy = lerp(restCy, standCy, easeInOut(p)) - Math.sin(p * Math.PI) * 120;
        ry = lerp(fallTurn, 0, easeOut(p));
        const l = seg(time, T.landUp, T.landUp + 0.3);
        sy = 1 - Math.sin(l * Math.PI) * 0.07;
        sx = 1 + Math.sin(l * Math.PI) * 0.04;
        // Holding the pose: a little paw wiggle and a slow turn, so you see it is a figure.
        const hold = seg(time, T.landUp + 0.2, T.landUp + 0.5) * (1 - seg(time, T.fly - 0.45, T.fly - 0.05));
        rot += Math.sin((time - T.landUp) * 4) * 1.8 * hold;
        ry += Math.sin((time - T.landUp) * 3.2) * 14 * hold;
      }
      // Tilts on the X axis too: leans back to look up at the drone, forward when it is close in front.
      const headY = cy - H * 0.3;
      const watching = time >= T.droneIn + 0.4 && time < T.fall ? 1 : time >= T.landUp ? 0.6 : 0;
      const tiltTarget = watching * clamp(((headY - d.y) / 220) * 14 - (d.z / 190) * 6, -14, 16);
      tiltX += (tiltTarget - tiltX) * Math.min(1, dt * 6);
      let rx = tiltX;

      let z = lerp(-220, 0, walkF(wp));
      let px = x * k;
      let py = cy * k;
      let s3 = 1;
      // Home: the 3D figure itself flies into the logo's place in the menu, with a turn.
      const navEl = document.querySelector<HTMLElement>("[data-nav-logo]");
      if (time >= T.fly && navEl) {
        const n = navEl.getBoundingClientRect();
        const p = easeInOut(seg(time, T.fly, T.flyEnd));
        const sNav = n.height / (H * k);
        const navX = n.left + (W * k * sNav) / 2 - vw / 2;
        const navCy = n.top + H * k * sNav - vh / 2 - (H / 2) * k;
        px = lerp(0, navX, p);
        py = lerp(standCy * k, navCy, p) - Math.sin(p * Math.PI) * 60;
        s3 = lerp(1, sNav, p);
        ry = 360 * p;
        rot = Math.sin(p * Math.PI) * -8;
        rx = lerp(rx, 0, p);
        z = 0;
      }
      if (cat.current) {
        cat.current.style.transform = `translate3d(${px}px, ${py}px, ${z * k}px) rotateZ(${rot}deg) rotateY(${ry}deg) rotateX(${rx}deg) translateY(${(H / 2) * k}px) scale3d(${sx * s3}, ${sy * s3}, ${s3})`;
      }
      // Light: the painted front is brightest when it faces you, darker as it turns away.
      const front = layers.current[0];
      if (front) front.style.filter = `brightness(${(0.86 + 0.16 * Math.max(0, Math.cos(rad(ry))) * Math.cos(rad(rx))).toFixed(3)})`;

      // Soft shadow on the floor, smaller when the cat is in the air.
      const air = clamp((standCy - cy) / 160);
      const lying = clamp(Math.abs(rot) / LIE) * (time >= T.fall ? 1 : 0);
      if (shadow.current) {
        const s = (1 - air * 0.5) * (1 + lying * 0.4);
        shadow.current.style.transform = `translate3d(${x * k}px, ${GROUND * k}px, ${z * k}px) rotateX(75deg) scale(${s * 1.15}, ${s * 0.75})`;
        shadow.current.style.opacity = String((0.5 - air * 0.25) * (1 - seg(time, T.fly, T.fly + 0.3)));
      }

      // The head on screen, for the dizzy stars.
      const hx0 = (0.47 - 0.5) * W * sx * Math.cos(rad(ry));
      const hz0 = -(0.47 - 0.5) * W * sx * Math.sin(rad(ry));
      const hy0 = (0.2 - 0.5) * H * sy;
      const hr = { x: hx0 * Math.cos(rad(rot)) - hy0 * Math.sin(rad(rot)), y: hx0 * Math.sin(rad(rot)) + hy0 * Math.cos(rad(rot)) };
      const headPx = project({ x: x + hr.x, y: cy + hr.y, z: z + hz0 });

      // Dizzy stars circle the head while it lies on its back.
      const sp = seg(time, T.land, T.jump);
      stars.current.forEach((el, i) => {
        if (!el) return;
        const vis = sp > 0 && sp < 1;
        el.style.display = vis ? "" : "none";
        if (!vis) return;
        const a = time * 5 + (i * Math.PI * 2) / 3;
        const fade = Math.sin(sp * Math.PI) ** 0.4;
        set(el, "transform", `translate(${headPx.x + Math.cos(a) * 46 * k} ${headPx.y - 10 * k + Math.sin(a) * 14 * k}) rotate(${time * 200}) scale(${fade * k})`);
      });

      // Little grey puffs: landing on its back and landing after the jump.
      const puffAt = (i0: number, t0: number, c: { x: number; y: number }, big = 1) => {
        for (let j = 0; j < 5; j++) {
          const el = puffs.current[i0 + j];
          if (!el) continue;
          const p = seg(time, t0, t0 + 0.55);
          const on = p > 0 && p < 1;
          el.style.display = on ? "" : "none";
          if (!on) continue;
          const a = rad(-170 + j * 40);
          const r = easeOut(p) * 70 * big * k;
          set(el, "cx", c.x + Math.cos(a) * r);
          set(el, "cy", c.y + Math.sin(a) * r * 0.35);
          set(el, "r", (10 + ((6 * j) % 4)) * big * k * (1 - p * 0.6));
          set(el, "opacity", 0.6 * (1 - p));
        }
      };
      puffAt(0, T.land, project({ x: 0, y: GROUND - 4, z: 0 }), 1.2);
      puffAt(5, T.landUp - 0.02, project({ x: 0, y: GROUND - 4, z: 0 }), 1.1);

      // The white veil fades away to the video as the cat flies home (the cat itself stays).
      const fade = seg(time, T.fly + 0.25, T.flyEnd);
      if (bg.current) bg.current.style.opacity = String(1 - fade);
      if (drone.current) drone.current.style.opacity = String(1 - seg(time, T.fly + 0.3, T.fly + 0.8));
      if (overlay.current) overlay.current.style.opacity = String(1 - fade);
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

  const preserve = { transformStyle: "preserve-3d" as const };

  return (
    <div ref={root} className="cat-intro fixed inset-0 z-[100]">
      <div
        ref={bg}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.95), rgba(242,242,245,0.9))",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      />
      <div ref={scene} className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2" style={preserve}>
          <div
            ref={shadow}
            className="absolute rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.35), rgba(0,0,0,0))", transform: "translate3d(-9999px,0,0)" }}
          />
          <div ref={cat} className="absolute" style={{ ...preserve, transformOrigin: "50% 100%", visibility: "hidden", transform: "translate3d(-9999px,0,0)" }}>
            {Array.from({ length: LAYERS }, (_, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                ref={(el) => {
                  layers.current[i] = el;
                }}
                src="/images/kat-logo-tiger.svg"
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full max-w-none select-none"
                // the layers behind the front get darker toward the back: the figure's edge
                style={i === 0 ? undefined : { filter: `brightness(${(0.42 - (0.27 * i) / (LAYERS - 1)).toFixed(3)})` }}
              />
            ))}
          </div>
          <div ref={drone} className="absolute" style={{ transform: "translate3d(-9999px,0,0)" }}>
            <Drone propRefs={props} />
          </div>
        </div>
      </div>
      <svg ref={overlay} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
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
        {Array.from({ length: 10 }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              puffs.current[i] = el;
            }}
            style={{ display: "none" }}
            fill="#d6d6da"
          />
        ))}
      </svg>
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
