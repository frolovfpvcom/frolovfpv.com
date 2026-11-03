"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/lang";

/* Kat-intro i 3D: første gang man kommer ind på siden hopper katten (logoet som en
   figur med tykkelse) ind fra venstre på en hvid, sløret baggrund. En lille drone flyver
   rundt om den i rummet, foran og bagved, og katten drejer efter den, til den snurrer
   rundt, bliver svimmel og falder på ryggen. Den springer op med en skrue, rækker ud efter
   dronen og flyver til sidst op i venstre hjørne, hvor logoet sidder, mens siden kommer frem.

   Figuren er logoet stablet i tynde lag (forside, mørk kant, bagside) i en CSS 3D-scene.
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
  fall: 5.75,
  land: 6.2,
  hover: 5.75,
  hoverEnd: 6.4,
  jump: 7.6,
  landUp: 8.25,
  fly: 9.35,
  flyEnd: 10.35,
  end: 10.45,
};

const LOGO_H = 235; // the cat's height in scene units
const LOGO_RATIO = 167 / 227;
const GROUND = 120; // scene y of the floor (scene origin = screen centre)
const LAYERS = 16; // slices that give the figure its thickness
const SLICE = 1.5; // scene units between slices
const PERSPECTIVE = 1300;
const ORIGIN_Y = 0.2; // the eye sits a bit above the cat, so we look down at the floor
const FALL_X = 62; // how far it tips back onto the floor

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeIn = (p: number) => p * p * p;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

type V3 = { x: number; y: number; z: number };

/** CSS order "rotateY rotateX rotateZ": the point turns about Z first, then X, then Y. */
function rotate3(p: V3, ry: number, rx: number, rz: number): V3 {
  let { x, y, z } = p;
  let c = Math.cos(rad(rz));
  let s = Math.sin(rad(rz));
  [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(rad(rx));
  s = Math.sin(rad(rx));
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(rad(ry));
  s = Math.sin(rad(ry));
  [x, z] = [x * c + z * s, -x * s + z * c];
  return { x, y, z };
}

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
    let look = 0; // the cat's smoothed turn toward the drone (deg)
    let fallFrom = 0; // its turn when it starts to fall
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
          if (el) el.style.transform = `translateZ(${-i * SLICE * k}px)`;
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
          scene.current.style.perspective = `${PERSPECTIVE * k}px`;
          scene.current.style.perspectiveOrigin = `50% ${ORIGIN_Y * 100}%`;
        }
      }

      // Screen position of a point in the 3D scene (scene units, origin = screen centre).
      const project = (p: V3) => {
        const ox = vw / 2;
        const oy = vh * ORIGIN_Y;
        const sx = vw / 2 + p.x * k;
        const sy = vh / 2 + p.y * k;
        const f = PERSPECTIVE / (PERSPECTIVE - p.z);
        return { x: ox + (sx - ox) * f, y: oy + (sy - oy) * f, f };
      };

      /* ---------- the drone ---------- */
      const droneY = GROUND - H * 1.08;
      const orbitAngle = (tt: number) => {
        const slow = seg(tt, T.orbit, T.orbitFast);
        const fast = seg(tt, T.orbitFast, T.fall);
        return 2 * Math.PI * (slow * 1.25) + 2 * Math.PI * (fast * fast * 2.4 + fast * 0.4);
      };
      const orbitPos = (tt: number): V3 & { a: number } => {
        const a = orbitAngle(tt);
        const tight = seg(tt, T.orbitFast, T.fall);
        const r = lerp(250, 175, tight);
        return { x: r * Math.cos(a), y: droneY + Math.sin(tt * 3) * 10 + tight * 40, z: r * Math.sin(a), a };
      };
      const hoverAbove: V3 = { x: 20, y: GROUND - 250, z: -80 };
      const pawPt: V3 = { x: -W / 2 + W * 0.8, y: GROUND - H - 52, z: 0 };
      const endOrbit = orbitPos(T.fall);
      const endHeading = 180 - deg(endOrbit.a);

      let d: V3;
      let heading = 180;
      let pitch = 62;
      let bank = 0;
      if (time < T.orbit) {
        const p = easeOut(seg(time, T.droneIn, T.orbit));
        const o = orbitPos(T.orbit);
        d = { x: lerp(halfW + 160, o.x, p), y: lerp(-halfH - 120, o.y, p), z: lerp(-300, o.z, p) };
        bank = lerp(-25, 0, p);
      } else if (time < T.fall) {
        const o = orbitPos(time);
        d = o;
        heading = 180 - deg(o.a);
        bank = -10 - 18 * seg(time, T.orbitFast, T.fall);
      } else if (time < T.jump) {
        const p = easeInOut(seg(time, T.hover, T.hoverEnd));
        d = {
          x: lerp(endOrbit.x, hoverAbove.x, p) + Math.sin(time * 2.4) * 10 * p,
          y: lerp(endOrbit.y, hoverAbove.y, p) + Math.sin(time * 3.1) * 8 * p,
          z: lerp(endOrbit.z, hoverAbove.z, p),
        };
        heading = endHeading;
        pitch = lerp(62, 40, p);
      } else if (time < T.fly) {
        const p = easeInOut(seg(time, T.jump, T.landUp + 0.1));
        d = {
          x: lerp(hoverAbove.x, pawPt.x, p) + Math.sin(time * 2.2) * 6,
          y: lerp(hoverAbove.y, pawPt.y, p) + Math.sin(time * 3.3) * 7,
          z: lerp(hoverAbove.z, pawPt.z, p),
        };
        heading = endHeading;
        pitch = lerp(40, 62, p);
        bank = Math.sin(time * 2.2) * 6;
      } else {
        const p = easeIn(seg(time, T.fly, T.fly + 0.8));
        d = { x: lerp(pawPt.x, halfW + 160, p), y: lerp(pawPt.y, -halfH - 140, p), z: lerp(0, -200, p) };
        heading = endHeading;
        bank = lerp(0, 30, p);
      }
      if (drone.current) {
        drone.current.style.transform = `translate3d(${d.x * k}px, ${d.y * k}px, ${d.z * k}px) rotateY(${heading}deg) rotateX(${pitch}deg) rotateZ(${bank}deg)`;
      }
      props.current.forEach((el, i) => set(el, "transform", `rotate(${(time * 2900 * (i % 3 === 0 ? 1 : -1)) % 360})`));

      /* ---------- the cat ---------- */
      const startX = -halfW - W;
      const wp = seg(time, T.walkStart, T.walkEnd);
      const walkF = (p: number) => 1 - (1 - p) * (1 - p);
      let x = lerp(startX, 0, walkF(wp));
      let z = lerp(-320, 0, walkF(wp));
      let y = 0; // height above the floor
      let ry = 0;
      let rx = 0;
      let rz = 0;
      let sx = 1;
      let sy = 1;
      const hopPhase = (time - T.walkStart) * Math.PI * 2.7;

      if (time < T.orbit) {
        // Little hops in from the left, turned toward where it is going.
        const moving = wp > 0 && wp < 1 ? clamp((1 - wp) * 3) : 0;
        const hop = Math.abs(Math.sin(hopPhase));
        y = -hop * 30 * moving;
        rz = Math.sin(hopPhase) * 6 * moving;
        sy = 1 - Math.pow(1 - hop, 6) * 0.08 * moving;
        sx = 1 + (1 - sy) * 0.6;
        ry = lerp(55, 0, easeInOut(seg(time, T.walkEnd - 0.7, T.walkEnd + 0.2)));
        look = ry;
      } else if (time < T.fall) {
        // Follows the drone with its eyes; in the fast laps it spins right round after it.
        const o = orbitPos(time);
        const fast = easeInOut(seg(time, T.orbitFast, T.orbitFast + 0.6));
        const peek = 48 * Math.cos(o.a);
        const spin = 90 - deg(o.a);
        const target = lerp(peek, spin + Math.round((peek - spin) / 360) * 360 * (1 - fast), fast);
        look += (target - look) * Math.min(1, dt * lerp(6, 30, fast));
        ry = look;
        rz = -5 * Math.cos(o.a) * (1 - fast);
        const hop = Math.abs(Math.sin(time * 9));
        y = -hop * 10 * fast;
        fallFrom = ry;
      } else if (time < T.jump) {
        // Dizzy: wobble, turn back to the front and tip over backwards onto the floor.
        const settle = easeOut(seg(time, T.fall, T.land));
        const nearest = Math.round(fallFrom / 360) * 360;
        ry = lerp(fallFrom, nearest, settle);
        const p = easeIn(seg(time, T.fall + 0.1, T.land));
        rx = FALL_X * p;
        rz = Math.sin(seg(time, T.fall, T.fall + 0.3) * Math.PI) * 9;
        const b = seg(time, T.land, T.land + 0.35);
        y = -Math.sin(b * Math.PI) * 10 * (1 - b);
        rx -= Math.sin(b * Math.PI) * 8 * (1 - b);
        // Lying there wriggling.
        if (time > T.land) rz = Math.sin(time * 13) * 4 * seg(time, T.land + 0.2, T.land + 0.5);
      } else {
        // Springs up with a full spin and lands reaching for the drone.
        const p = seg(time, T.jump, T.landUp);
        rx = FALL_X * (1 - easeOut(p));
        y = -Math.sin(p * Math.PI) * 150;
        ry = 360 * easeInOut(p);
        const l = seg(time, T.landUp, T.landUp + 0.3);
        sy = 1 - Math.sin(l * Math.PI) * 0.07;
        sx = 1 + Math.sin(l * Math.PI) * 0.04;
        // While it holds the pose it sways a little, so you see it is a real figure.
        const hold = seg(time, T.landUp + 0.2, T.landUp + 0.5) * (1 - seg(time, T.fly - 0.45, T.fly - 0.05));
        ry += Math.sin((time - T.landUp) * 3.2) * 16 * hold;
        y += -Math.abs(Math.sin((time - T.landUp) * 4)) * 4 * hold;
      }
      x = time >= T.orbit ? 0 : x;
      z = time >= T.orbit ? 0 : z;
      const catVisible = time < T.fly;
      if (cat.current) {
        cat.current.style.visibility = catVisible ? "visible" : "hidden";
        cat.current.style.transform = `translate3d(${x * k}px, ${(GROUND + y) * k}px, ${z * k}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${sx}, ${sy})`;
      }

      // Soft shadow on the floor, shrinking when the cat is in the air.
      if (shadow.current) {
        const air = clamp(-y / 160);
        const lying = rx / FALL_X;
        const s = (1 - air * 0.5) * (1 + lying * 0.5);
        shadow.current.style.transform = `translate3d(${x * k}px, ${GROUND * k}px, ${(z - lying * 60) * k}px) rotateX(90deg) scale(${s * 1.15}, ${s * (0.75 + lying * 0.7)})`;
        shadow.current.style.opacity = String((0.5 - air * 0.25) * (1 - seg(time, T.fly, T.fly + 0.3)));
      }

      // Points on the figure, for stars and puffs (projected to the screen).
      const catPoint = (lx: number, ly: number) => {
        const r = rotate3({ x: lx * sx, y: ly * sy, z: 0 }, ry, rx, rz);
        return project({ x: x + r.x, y: GROUND + y + r.y, z: z + r.z });
      };
      const headPx = catPoint(-W * 0.08, -H * 0.8);

      // Dizzy stars circle the head while it lies on the floor.
      const sp = seg(time, T.land - 0.1, T.jump);
      stars.current.forEach((el, i) => {
        if (!el) return;
        const vis = sp > 0 && sp < 1;
        el.style.display = vis ? "" : "none";
        if (!vis) return;
        const a = time * 5 + (i * Math.PI * 2) / 3;
        const fade = Math.sin(sp * Math.PI) ** 0.4;
        set(el, "transform", `translate(${headPx.x + Math.cos(a) * 52 * k} ${headPx.y - 30 * k + Math.sin(a) * 14 * k}) rotate(${time * 200}) scale(${fade * k})`);
      });

      // Little grey puffs: landing on the back and landing after the jump.
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
      puffAt(0, T.land, project({ x: 0, y: GROUND - 4, z: -60 }), 1.2);
      puffAt(5, T.landUp - 0.02, project({ x: 0, y: GROUND - 4, z: 0 }), 1.1);

      /* ---------- the flight to the corner ---------- */
      if (logo.current) {
        const visible = time >= T.fly;
        logo.current.style.visibility = visible ? "visible" : "hidden";
        const navEl = document.querySelector<HTMLElement>("[data-nav-logo]");
        if (visible && navEl) {
          const tl = { x: vw / 2 - (W * k) / 2, y: vh / 2 + (GROUND - H) * k };
          const w = W * k;
          const h = H * k;
          const n = navEl.getBoundingClientRect();
          const p = easeInOut(seg(time, T.fly, T.flyEnd));
          const lx = lerp(tl.x, n.left, p);
          const ly = lerp(tl.y, n.top, p) - Math.sin(p * Math.PI) * 60;
          const s = lerp(1, n.height / h, p);
          logo.current.style.width = `${w}px`;
          logo.current.style.height = `${h}px`;
          logo.current.style.transform = `translate(${lx}px, ${ly}px) scale(${s}) rotate(${Math.sin(p * Math.PI) * -8}deg)`;
        }
      }

      // The white veil and the scene fade away as the cat flies home.
      const fade = seg(time, T.fly + 0.25, T.flyEnd);
      if (bg.current) bg.current.style.opacity = String(1 - fade);
      if (scene.current) scene.current.style.opacity = String(1 - fade);
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
                src={i === 0 || i === LAYERS - 1 ? "/images/kat-logo-tiger.svg" : "/images/kat-logo-tiger-side.svg"}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full max-w-none select-none"
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={logo} src="/images/kat-logo-tiger.svg" alt="" className="pointer-events-none fixed top-0 left-0 max-w-none origin-top-left" style={{ visibility: "hidden" }} />
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
