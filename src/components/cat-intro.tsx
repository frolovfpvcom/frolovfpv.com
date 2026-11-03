"use client";

import { useEffect, useRef, useState } from "react";
import type * as ThreeNS from "three";
import { useT } from "@/lib/lang";

/* Kat-intro i rigtig 3D (Three.js / WebGL). Første gang man kommer ind på siden går en
   3D-kat, bygget som logoet (hvid med sorte tigerstriber, sorte FPV-briller med rem og to
   antenner, stribet buet hale), ind fra venstre på en hvid, sløret baggrund. En 3D FPV-drone
   flyver ind og cirkler om den; katten følger den med hoved og overkrop, bliver rundtosset
   og vælter om på ryggen med benene i vejret. Så rejser den sig på bagbenene i logoets
   positur, rækker op mod dronen og flyver til sidst op på logoets plads i menuen, mens det
   hvide fader ud til videoen.

   Alt er bygget i koden (ingen .glb-filer). Three.js hentes først, når intro'en faktisk
   skal vises. Et lille script i <head> (se layout.tsx) afgør før første paint, om den skal
   vises: én gang pr. fane, aldrig ved "reducer bevægelse", og altid med ?intro i adressen. */

type THREE = typeof ThreeNS;

const T = {
  walkStart: 0.2,
  walkEnd: 3.8,
  droneIn: 0.8,
  droneOrbit: 2.0,
  follow: 4.0,
  dizzy: 6.0,
  topple: 6.35,
  onBack: 7.0,
  rise: 8.0,
  pose: 8.85,
  dock: 10.0,
  dockEnd: 11.5,
  end: 12.0,
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeIn = (p: number) => p * p * p;
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const texts = {
  da: { skip: "Spring over" },
  en: { skip: "Skip" },
};

/* ---------- the cat's pose: every joint, so poses can be blended ---------- */

type Pose = {
  x: number; // where the cat stands
  ry: number; // which way it faces (0 = to the right, -PI/2 = at the camera)
  bodyY: number;
  bodyRz: number; // pitch: >0 lifts the front (up on its hind legs)
  bodyRx: number; // roll: PI = on its back
  bodyRy: number; // twist toward the drone
  headRx: number;
  headRy: number;
  headRz: number;
  neck: number; // 0 = head in front of the body, 1 = head on top (when it stands up)
  legs: [number, number, number, number][]; // per leg: [swing, spread, twist, knee]
  tailRx: number;
  tailRy: number;
  tailRz: number;
};

const legsZero = (): Pose["legs"] => [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const BODY_Y = 0.93; // body height when it stands on four legs
const BACK_Y = 0.45; // body height when it lies on its back
const BACK_RY = -0.2;

const standPose = (): Pose => ({
  x: 0,
  ry: -0.35,
  bodyY: BODY_Y,
  bodyRz: 0,
  bodyRx: 0,
  bodyRy: 0,
  headRx: 0,
  headRy: 0,
  headRz: 0,
  neck: 0,
  legs: legsZero(),
  tailRx: 0,
  tailRy: 0,
  tailRz: 0,
});

// The logo: up on the hind legs in a 3/4 view facing your right, the left front paw (on
// your right) reaching up past the head, the other paw curled at the chest, the tail
// sweeping out and up on your left and the head with the goggles looking up at the drone.
const LOGO_PITCH = 1.4;
const logoPose = (): Pose => ({
  x: 0,
  ry: -1.2,
  bodyY: 1.31,
  bodyRz: LOGO_PITCH,
  bodyRx: 0,
  bodyRy: 0,
  headRx: 0.25,
  headRy: 0.12,
  headRz: -0.95,
  neck: 1,
  legs: [
    [1.3, 0, 0.55, -0.1], // front left: the paw reaching up
    [-0.83, 0, 0, 0.95], // front right: curled at the chest
    [-LOGO_PITCH + 0.45, 0, 0, -0.5], // hind left: stepping forward
    [-LOGO_PITCH, 0, 0, 0], // hind right: standing
  ],
  tailRx: 1.25,
  tailRy: 0,
  tailRz: -1.3,
});

function mixPose(a: Pose, b: Pose, p: number): Pose {
  const out = {} as Pose;
  for (const key of Object.keys(a) as (keyof Pose)[]) {
    if (key === "legs") continue;
    (out[key] as number) = lerp(a[key] as number, b[key] as number, p);
  }
  out.legs = a.legs.map((l, i) => l.map((v, j) => lerp(v, b.legs[i][j], p)) as [number, number, number, number]);
  return out;
}

/* ---------- textures drawn in code ---------- */

function canvasTexture(three: THREE, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#111111";
  draw(ctx);
  const tex = new three.CanvasTexture(canvas);
  tex.colorSpace = three.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** A tapered, slightly wavy tiger stripe running across the texture at height y. */
function stripe(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, thick: number, wave: number) {
  const mid = (x0 + x1) / 2;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.quadraticCurveTo((x0 + mid) / 2, y - thick + wave, mid, y - thick * 0.9);
  ctx.quadraticCurveTo((mid + x1) / 2, y - thick - wave, x1, y);
  ctx.quadraticCurveTo((mid + x1) / 2, y + thick * 0.4 - wave, mid, y + thick * 0.5);
  ctx.quadraticCurveTo((x0 + mid) / 2, y + thick * 0.4 + wave, x0, y);
  ctx.fill();
}

/* ---------- the scene ---------- */

function buildScene(three: THREE) {
  const scene = new three.Scene();

  // Soft light, and a floor that only shows the shadow.
  scene.add(new three.AmbientLight(0xffffff, 1.3));
  const sun = new three.DirectionalLight(0xffffff, 1.4);
  sun.position.set(3, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -5;
  sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5;
  sun.shadow.camera.bottom = -5;
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const floor = new three.Mesh(new three.PlaneGeometry(30, 30), new three.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Cartoon shading in three soft steps, like the flat logo but with real form.
  const steps = new Uint8Array([150, 215, 255]);
  const gradient = new three.DataTexture(steps, steps.length, 1, three.RedFormat);
  gradient.minFilter = three.NearestFilter;
  gradient.magFilter = three.NearestFilter;
  gradient.needsUpdate = true;
  const toon = (opts: ThreeNS.MeshToonMaterialParameters) => new three.MeshToonMaterial({ gradientMap: gradient, ...opts });

  // Body: stripes from the spine down both flanks (the texture wraps around the body with
  // the belly at the seam), the belly stays white.
  const bodyTex = canvasTexture(three, 512, 512, (ctx) => {
    for (let i = 0; i < 9; i++) {
      const y = 70 + i * 44;
      stripe(ctx, 44 + (i % 2) * 14, 468 - (i % 3) * 12, y, 15, i % 2 ? 6 : -6);
    }
  });
  // Legs: bands around the leg.
  const legTex = canvasTexture(three, 256, 256, (ctx) => {
    for (let i = 0; i < 4; i++) stripe(ctx, 0, 256, 60 + i * 46, 12, i % 2 ? 4 : -4);
  });
  // Head: short marks on the forehead and on the cheeks.
  const headTex = canvasTexture(three, 512, 256, (ctx) => {
    for (const [x, w] of [
      [222, 16],
      [256, 18],
      [290, 16],
    ]) {
      ctx.beginPath();
      ctx.moveTo(x - w / 2, 10);
      ctx.quadraticCurveTo(x, 70, x + 2, 82);
      ctx.quadraticCurveTo(x + w / 2, 40, x + w / 2, 10);
      ctx.fill();
    }
    for (const x of [150, 362]) {
      stripe(ctx, x - 40, x + 40, 150, 9, 3);
      stripe(ctx, x - 34, x + 34, 176, 7, -3);
    }
  });
  // Tail: black and white bands, black tip.
  const tailTex = canvasTexture(three, 512, 32, (ctx) => {
    for (let i = 0; i < 7; i++) ctx.fillRect(40 + i * 66, 0, 30, 32);
    ctx.fillRect(470, 0, 42, 32);
  });

  const fur = toon({ map: bodyTex });
  const legFur = toon({ map: legTex });
  const headFur = toon({ map: headTex });
  const tailFur = toon({ map: tailTex });
  const white = toon({ color: 0xffffff });
  const black = new three.MeshStandardMaterial({ color: 0x111111, roughness: 0.32, metalness: 0.1 });
  const grey = new three.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.35 });

  // Black outline like the logo: the same shape pushed out along its normals, inside out.
  const outline = new three.MeshBasicMaterial({ color: 0x111111, side: three.BackSide });
  outline.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = position + normal * 0.024;");
  };

  const add = (parent: ThreeNS.Object3D, geo: ThreeNS.BufferGeometry, mat: ThreeNS.Material, lined = true) => {
    const mesh = new three.Mesh(geo, mat);
    mesh.castShadow = true;
    parent.add(mesh);
    if (lined) {
      const line = new three.Mesh(geo, outline);
      mesh.add(line);
    }
    return mesh;
  };

  /* --- the cat --- */
  const cat = new three.Group();
  scene.add(cat);
  const body = new three.Group();
  body.position.y = BODY_Y;
  cat.add(body);

  const torso = add(body, new three.CapsuleGeometry(0.42, 0.78, 12, 28), fur);
  torso.rotation.z = Math.PI / 2;
  torso.scale.set(1, 1, 0.92);

  // Head with ears, muzzle, nose and the FPV goggles.
  const head = new three.Group();
  head.position.set(0.82, 0.4, 0);
  head.scale.setScalar(1.12);
  body.add(head);
  const skull = add(head, new three.SphereGeometry(0.4, 32, 24), headFur);
  skull.scale.set(1, 0.92, 1.06);
  const earGeo = new three.ConeGeometry(0.15, 0.34, 4, 1);
  for (const side of [-1, 1]) {
    const ear = add(head, earGeo, white);
    ear.position.set(-0.04, 0.37, side * 0.22);
    ear.rotation.set(side * 0.32, Math.PI / 4, -0.12);
  }
  const muzzle = add(head, new three.SphereGeometry(0.17, 20, 16), white);
  muzzle.position.set(0.31, -0.15, 0);
  muzzle.scale.set(0.8, 0.68, 1.15);
  const nose = add(head, new three.SphereGeometry(0.045, 12, 8), black, false);
  nose.position.set(0.44, -0.08, 0);

  const goggles = new three.Group();
  head.add(goggles);
  const visorShell = add(goggles, new three.CylinderGeometry(0.47, 0.47, 0.27, 28, 1, false, Math.PI / 2 - 1.15, 2.3), black, false);
  visorShell.position.y = 0.07;
  visorShell.scale.z = 1.08;
  const visorFace = add(goggles, new three.BoxGeometry(0.12, 0.25, 0.56), black, false);
  visorFace.position.set(0.44, 0.07, 0);
  const shine = add(goggles, new three.BoxGeometry(0.01, 0.022, 0.38), new three.MeshBasicMaterial({ color: 0xffffff }), false);
  shine.position.set(0.505, 0.14, 0);
  const strap = add(goggles, new three.TorusGeometry(0.42, 0.04, 8, 40), black, false);
  strap.rotation.x = Math.PI / 2;
  strap.position.y = 0.09;
  strap.rotation.y = 0.12;
  const antGeo = new three.BoxGeometry(0.05, 0.32, 0.07);
  for (const side of [-1, 1]) {
    const ant = add(goggles, antGeo, black, false);
    ant.position.set(0.3, 0.33, side * 0.2);
    ant.rotation.set(side * 0.3, 0, 0.42);
  }

  // Four legs on pivots at the hips and shoulders, each with a knee and a paw.
  const legGeo = new three.CapsuleGeometry(0.125, 0.3, 8, 16);
  const lowerGeo = new three.CapsuleGeometry(0.11, 0.26, 8, 16);
  const pawGeo = new three.SphereGeometry(0.135, 16, 12);
  const legs: { hip: ThreeNS.Group; knee: ThreeNS.Group; paw: ThreeNS.Object3D }[] = [];
  for (const [x, z] of [
    [0.46, -0.22], // front left
    [0.46, 0.22], // front right
    [-0.46, -0.22], // hind left
    [-0.46, 0.22], // hind right
  ]) {
    const hip = new three.Group();
    hip.position.set(x, -0.16, z);
    body.add(hip);
    const upper = add(hip, legGeo, legFur);
    upper.position.y = -0.2;
    const knee = new three.Group();
    knee.position.y = -0.4;
    hip.add(knee);
    const lower = add(knee, lowerGeo, legFur);
    lower.position.y = -0.14;
    const paw = add(knee, pawGeo, white);
    paw.position.set(0.04, -0.33, 0);
    paw.scale.set(1.15, 0.75, 1);
    legs.push({ hip, knee, paw });
  }

  // A tail that curves up, striped black and white.
  const tail = new three.Group();
  tail.position.set(-0.74, 0.14, 0);
  body.add(tail);
  const curve = new three.CatmullRomCurve3([
    new three.Vector3(0, 0, 0),
    new three.Vector3(-0.28, 0.12, 0),
    new three.Vector3(-0.45, 0.45, 0),
    new three.Vector3(-0.38, 0.82, 0),
    new three.Vector3(-0.16, 1.0, 0),
  ]);
  add(tail, new three.TubeGeometry(curve, 48, 0.085, 12), tailFur);
  const tip = add(tail, new three.SphereGeometry(0.085, 12, 10), black, false);
  tip.position.copy(curve.getPoint(1));

  /* --- the FPV drone --- */
  const drone = new three.Group();
  scene.add(drone);
  const frame = new three.Group();
  drone.add(frame);
  for (const a of [Math.PI / 4, -Math.PI / 4]) {
    const arm = add(frame, new three.BoxGeometry(0.7, 0.035, 0.06), black, false);
    arm.rotation.y = a;
  }
  const hull = add(frame, new three.BoxGeometry(0.24, 0.09, 0.15), white);
  hull.position.y = 0.04;
  const cam = add(frame, new three.BoxGeometry(0.06, 0.06, 0.07), black, false);
  cam.position.set(0.14, 0.03, 0);
  const props: ThreeNS.Object3D[] = [];
  for (const [px, pz] of [
    [0.25, 0.25],
    [-0.25, 0.25],
    [0.25, -0.25],
    [-0.25, -0.25],
  ]) {
    const motor = add(frame, new three.CylinderGeometry(0.035, 0.035, 0.06, 12), black, false);
    motor.position.set(px, 0.03, pz);
    const guard = add(frame, new three.TorusGeometry(0.17, 0.013, 6, 32), black, false);
    guard.rotation.x = Math.PI / 2;
    guard.position.set(px, 0.05, pz);
    const prop = new three.Group();
    prop.position.set(px, 0.07, pz);
    frame.add(prop);
    add(prop, new three.BoxGeometry(0.3, 0.006, 0.035), black, false);
    const blur = add(prop, new three.CircleGeometry(0.15, 24), grey, false);
    blur.rotation.x = -Math.PI / 2;
    blur.castShadow = false;
    props.push(prop);
  }

  return { scene, sun, cat, body, head, legs, tail, drone, frame, props };
}

export function CatIntro() {
  const [active, setActive] = useState(true);
  const t = useT(texts);
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const skipAt = useRef<number | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") {
      setActive(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let cancelled = false;
    let raf = 0;
    let cleanupScene = () => {};
    let finished = false;
    const navLogo = () => document.querySelector<HTMLElement>("[data-nav-logo]");

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      const nav = navLogo();
      if (nav) nav.style.opacity = "";
      delete html.dataset.intro;
      document.body.style.overflow = prevOverflow;
      cleanupScene();
      setActive(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipAt.current ??= performance.now();
    };
    window.addEventListener("keydown", onKey);

    // While building (never in production), a moment can be pinned with ?introAt=9, or set
    // from the browser with window.__introT, to look at one frame at a time.
    const pinned = process.env.NODE_ENV !== "production" ? Number(new URLSearchParams(location.search).get("introAt") ?? NaN) : NaN;
    const devTime = () => {
      if (process.env.NODE_ENV === "production") return NaN;
      const set = (window as unknown as { __introT?: number }).__introT;
      return typeof set === "number" ? set : pinned;
    };

    import("three")
      .then((three) => {
        if (cancelled || !mount.current) return;
        let renderer: ThreeNS.WebGLRenderer;
        try {
          renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          finish(); // no WebGL: just show the site
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = three.PCFShadowMap;
        renderer.outputColorSpace = three.SRGBColorSpace;
        renderer.domElement.style.display = "block";
        mount.current.appendChild(renderer.domElement);

        const s = buildScene(three);
        const camera = new three.PerspectiveCamera(40, 1, 0.1, 100);
        const lookAt = new three.Vector3(0, 0.95, 0);
        let halfW = 4;
        const resize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const aspect = w / h;
          renderer.setSize(w, h);
          camera.aspect = aspect;
          // Far enough back that about 4.8 units fit across, even on a phone held upright.
          const dist = Math.max(7.5, 4.8 / (2 * Math.tan(((camera.fov / 2) * Math.PI) / 180) * aspect));
          camera.position.set(0, 1.45, dist);
          camera.lookAt(lookAt);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();
          halfW = dist * Math.tan(((camera.fov / 2) * Math.PI) / 180) * aspect;
        };
        resize();
        window.addEventListener("resize", resize);

        cleanupScene = () => {
          cleanupScene = () => {};
          window.removeEventListener("resize", resize);
          s.scene.traverse((o) => {
            const m = o as ThreeNS.Mesh;
            m.geometry?.dispose();
            const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
            mats.forEach((mat) => {
              (mat as ThreeNS.MeshToonMaterial).map?.dispose();
              (mat as ThreeNS.MeshToonMaterial).gradientMap?.dispose();
              mat.dispose();
            });
          });
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };

        const v = new three.Vector3();
        const toScreen = (p: ThreeNS.Vector3) => {
          v.copy(p).project(camera);
          return { x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight, z: v.z };
        };
        const fromScreen = (x: number, y: number, ndcZ: number) =>
          new three.Vector3((x / window.innerWidth) * 2 - 1, 1 - (y / window.innerHeight) * 2, ndcZ).unproject(camera);

        const local = new three.Vector3();
        const pawWorld = new three.Vector3();
        let dockFrom: { center: ThreeNS.Vector3; offset: ThreeNS.Vector3; height: number; ndcZ: number; cx: number; cy: number } | null = null;
        // The clock only moves while frames are drawn, and never more than 0.1 s per frame,
        // so a slow first frame or a stalled tab does not skip the walk in.
        let clock = 0;
        let last = -1;
        let began = -1;

        const apply = (p: Pose) => {
          s.cat.position.set(p.x, 0, 0);
          s.cat.rotation.set(0, p.ry, 0);
          s.body.position.y = p.bodyY;
          s.body.rotation.set(p.bodyRx, p.bodyRy, p.bodyRz, "YXZ");
          s.head.position.set(lerp(0.82, 0.92, p.neck), lerp(0.4, 0.05, p.neck), 0);
          s.head.rotation.set(p.headRx, p.headRy, p.headRz, "YXZ");
          s.legs.forEach((leg, i) => {
            leg.hip.rotation.set(p.legs[i][1], p.legs[i][2], p.legs[i][0]);
            leg.knee.rotation.set(0, 0, p.legs[i][3]);
          });
          s.tail.rotation.set(p.tailRx, p.tailRy, p.tailRz);
        };

        const frame = (now: number) => {
          clock += last < 0 ? 0 : Math.min(0.1, (now - last) / 1000);
          last = now;
          if (began < 0) began = now;
          const dev = devTime();
          const time = Number.isFinite(dev) ? dev : clock;
          if (!Number.isFinite(dev) && now - began > 20000) return finish(); // a very slow device: just show the site

          if (skipAt.current !== null) {
            const q = seg(now, skipAt.current, skipAt.current + 350);
            if (root.current) root.current.style.opacity = String(1 - q);
            if (q >= 1) return finish();
            raf = requestAnimationFrame(frame);
            return;
          }

          /* --- the drone: flies in, circles the cat, comes in close, hovers --- */
          const droneAngle = (tt: number) => {
            const a = seg(tt, T.droneOrbit, T.dizzy);
            return -0.6 + a * Math.PI * 2 * 2.6 + Math.pow(a, 2) * Math.PI * 2;
          };
          const orbit = (tt: number) => {
            const a = droneAngle(tt);
            const close = easeInOut(seg(tt, T.follow, T.dizzy));
            const r = lerp(1.75, 1.15, close);
            const cx = lerp(-1.2, 0, easeOut(seg(tt, T.walkStart, T.walkEnd)));
            return new three.Vector3(cx + Math.cos(a) * r, lerp(1.85, 1.6, close) + Math.sin(tt * 3.2) * 0.12, Math.sin(a) * r);
          };
          const hover = new three.Vector3(0.15, 2.15, 0.25);
          let dp: ThreeNS.Vector3;
          let bank = 0;
          if (time < T.droneOrbit) {
            const q = easeOut(seg(time, T.droneIn, T.droneOrbit));
            dp = new three.Vector3(halfW + 1.5, 3.4, -1.5).lerp(orbit(T.droneOrbit), q);
            bank = lerp(0.5, 0.15, q);
          } else if (time < T.dizzy) {
            dp = orbit(time);
            bank = 0.25;
          } else if (time < T.rise) {
            const q = easeInOut(seg(time, T.dizzy, T.onBack));
            dp = orbit(T.dizzy).lerp(hover, q);
            dp.y += Math.sin(time * 3) * 0.06;
          } else {
            dp = hover.clone();
          }

          /* --- the cat --- */
          let pose = standPose();
          const startX = -halfW - 1.4;
          if (time < T.walkEnd + 0.3) {
            // Walks in from the left: diagonal legs together, the body rocks, the tail swings.
            const wp = seg(time, T.walkStart, T.walkEnd);
            const xf = 1 - Math.pow(1 - wp, 2);
            const speed = wp > 0 && wp < 1 ? clamp(2 * (1 - wp) * 1.2) : 0;
            pose.x = lerp(startX, 0, xf);
            const phase = ((pose.x - startX) / 0.62) * Math.PI;
            const swing = Math.sin(phase) * 0.55 * speed;
            pose.legs[0][0] = swing;
            pose.legs[3][0] = swing;
            pose.legs[1][0] = -swing;
            pose.legs[2][0] = -swing;
            for (let i = 0; i < 4; i++) pose.legs[i][3] = Math.max(0, -pose.legs[i][0]) * 0.7 * (i < 2 ? -1 : 1);
            pose.bodyY = BODY_Y + Math.abs(Math.cos(phase)) * 0.035 * speed;
            pose.bodyRx = Math.sin(phase) * 0.05 * speed;
            pose.bodyRz = Math.sin(phase * 2) * 0.02 * speed;
            pose.headRz = Math.sin(phase * 2) * 0.04 * speed;
            pose.tailRx = Math.sin(time * 5) * 0.28;
            pose.tailRz = Math.sin(time * 3.4) * 0.12;
          }

          // Follows the drone with head and upper body (looking in X, Y and Z).
          const looking = seg(time, T.droneOrbit - 0.4, T.droneOrbit + 0.4) * (1 - seg(time, T.dizzy, T.dizzy + 0.3));
          if (looking > 0) {
            apply(pose);
            s.cat.updateMatrixWorld(true);
            local.copy(dp);
            s.body.worldToLocal(local);
            local.sub(s.head.position);
            const yaw = Math.atan2(-local.z, Math.max(local.x, 0.15));
            const pitch = Math.atan2(local.y, Math.hypot(local.x, local.z));
            const close = seg(time, T.follow, T.follow + 0.4);
            pose.headRy = lerp(pose.headRy, clamp(yaw * 0.8, -1.1, 1.1), looking);
            pose.headRz = lerp(pose.headRz, clamp(pitch * 0.85, -0.5, 0.9), looking);
            pose.headRx = lerp(pose.headRx, clamp(-yaw * 0.25, -0.35, 0.35), looking * close);
            pose.bodyRy = lerp(0, clamp(yaw * 0.35, -0.45, 0.45), looking * close);
            pose.bodyRz += lerp(0, clamp(pitch * 0.18, -0.1, 0.2), looking * close);
            pose.ry += lerp(0, clamp(yaw * 0.2, -0.3, 0.3), looking * close);
            pose.tailRx = lerp(pose.tailRx, Math.sin(time * 4) * 0.35, close);
          }

          if (time >= T.dizzy && time < T.rise) {
            // Dizzy: the head wobbles, then it topples over onto its back, legs in the air.
            const wob = seg(time, T.dizzy, T.topple);
            pose.bodyRx = Math.sin(wob * Math.PI * 3) * 0.14 * (1 - wob * 0.3);
            pose.headRx = Math.sin(time * 14) * 0.2 * (1 - seg(time, T.topple, T.onBack));
            pose.headRz = 0.25;
            const q = easeIn(seg(time, T.topple, T.onBack));
            pose.bodyRx = lerp(pose.bodyRx, -Math.PI, q);
            pose.bodyY = lerp(BODY_Y, BACK_Y, q) + Math.sin(q * Math.PI) * 0.1;
            const bounce = seg(time, T.onBack, T.onBack + 0.35);
            pose.bodyY += Math.sin(bounce * Math.PI) * 0.08 * (1 - bounce);
            pose.ry = lerp(-0.35, BACK_RY, q);
            // Legs tuck while it rolls, then kick in the air.
            const kick = seg(time, T.onBack + 0.1, T.onBack + 0.35);
            for (let i = 0; i < 4; i++) {
              pose.legs[i][0] = lerp(0.6 * q * (i < 2 ? -1 : 1), Math.sin(time * 11 + i * 1.7) * 0.45, kick);
              pose.legs[i][3] = (i < 2 ? -1 : 1) * (0.3 + Math.sin(time * 11 + i) * 0.2) * kick;
              pose.legs[i][1] = (i % 2 === 0 ? 0.22 : -0.22) * kick;
            }
            pose.headRz = lerp(pose.headRz, 0.5 + Math.sin(time * 6) * 0.1, kick);
            pose.headRy = Math.sin(time * 5) * 0.25 * kick;
            pose.tailRx = Math.sin(time * 7) * 0.4 * kick;
            pose.tailRz = -0.4 * q;
          }

          if (time >= T.rise) {
            // Rolls back up and rises onto the hind legs, into the logo's pose.
            const back = standPose();
            back.bodyRx = -Math.PI;
            back.bodyY = BACK_Y;
            back.ry = BACK_RY;
            back.headRz = 0.5;
            back.tailRz = -0.4;
            for (let i = 0; i < 4; i++) back.legs[i][3] = i < 2 ? -0.5 : 0.5;
            const q = easeInOut(seg(time, T.rise, T.pose));
            pose = mixPose(back, logoPose(), q);
            pose.bodyY += Math.sin(q * Math.PI) * 0.35;
            // Holding the pose, the paw reaches and the head bobs toward the drone.
            const hold = seg(time, T.pose, T.pose + 0.3);
            pose.legs[0][0] += Math.sin((time - T.pose) * 5) * 0.08 * hold;
            pose.headRz += Math.sin((time - T.pose) * 2.5) * 0.05 * hold;
            pose.tailRz += Math.sin((time - T.pose) * 3) * 0.08 * hold;
          }

          apply(pose);
          s.cat.scale.setScalar(1);
          s.cat.updateMatrixWorld(true);

          // In the pose the drone waits just above the reaching paw.
          if (time >= T.rise) {
            s.legs[0].paw.getWorldPosition(pawWorld);
            const q = easeInOut(seg(time, T.rise + 0.3, T.pose + 0.2));
            const target = pawWorld.clone().add(new three.Vector3(0.18, 0.42, 0));
            dp = hover.clone().lerp(target, q);
            dp.y += Math.sin(time * 3.3) * 0.05;
            if (time > T.dock) {
              const q2 = easeIn(seg(time, T.dock, T.dock + 0.8));
              dp.lerp(new three.Vector3(halfW + 2, 4, -1), q2);
            }
          }
          s.drone.position.copy(dp);
          s.drone.rotation.set(0, Math.atan2(-(dp.z - 0), dp.x) + Math.PI / 2, bank * Math.sin(time * 1.3) * 0.6);
          s.frame.rotation.x = 0.12;
          s.props.forEach((p, i) => (p.rotation.y = time * 60 * (i % 3 === 0 ? 1 : -1)));

          /* --- home: the cat flies up into the logo's place in the menu --- */
          const nav = navLogo();
          if (time >= T.dock && nav) {
            if (!dockFrom) {
              const box = new three.Box3().setFromObject(s.cat);
              const center = box.getCenter(new three.Vector3());
              const top = toScreen(new three.Vector3(center.x, box.max.y, center.z));
              const bottom = toScreen(new three.Vector3(center.x, box.min.y, center.z));
              const c = toScreen(center);
              dockFrom = { center, offset: center.clone().sub(s.cat.position), height: bottom.y - top.y, ndcZ: c.z, cx: c.x, cy: c.y };
            }
            const r = nav.getBoundingClientRect();
            const q = easeInOut(seg(time, T.dock, T.dockEnd));
            const scale = lerp(1, r.height / dockFrom.height, q);
            const sx = lerp(dockFrom.cx, r.left + r.width / 2, q);
            const sy = lerp(dockFrom.cy, r.top + r.height / 2, q) - Math.sin(q * Math.PI) * 70;
            const world = fromScreen(sx, sy, dockFrom.ndcZ);
            s.cat.scale.setScalar(scale);
            s.cat.position.copy(world.sub(dockFrom.offset.clone().multiplyScalar(scale)));
            s.cat.rotation.y += Math.sin(q * Math.PI) * 0.6;
            // At the very end the real logo takes over in the same spot.
            const swap = seg(time, T.dockEnd - 0.25, T.dockEnd);
            renderer.domElement.style.opacity = String(1 - swap);
            nav.style.opacity = String(swap);
          }

          // The white veil fades to the video as the cat flies home.
          const fade = seg(time, T.dock + 0.3, T.dockEnd);
          if (bg.current) bg.current.style.opacity = String(1 - fade);
          if (root.current) root.current.style.pointerEvents = time > T.dock ? "none" : "";

          renderer.render(s.scene, camera);
          if (time >= T.end) return finish();
          raf = requestAnimationFrame(frame);
        };
        // Build the shaders before the clock starts, so the first frames do not stutter.
        renderer.compile(s.scene, camera);
        raf = requestAnimationFrame(frame);
      })
      .catch(() => finish());

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      cleanupScene();
    };
  }, []);

  if (!active) return null;

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
      <div ref={mount} className="pointer-events-none absolute inset-0" aria-hidden="true" />
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
