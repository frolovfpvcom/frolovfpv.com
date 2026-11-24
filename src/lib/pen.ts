/* Hand-drawn pen marks for the "notesbog" sections on the front page: loose boxes, ovals,
   underlines and curved arrows, as SVG path strings. Each mark takes a seed, so it looks the
   same on every render (and on the server and in the browser).
   The shapes follow the MIT-licensed Marginalia Portfolio Template by Kedhareswer Naidu. */

export type Pt = [number, number];

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

/** Deterministic 0..1 noise. */
export function rand(seed: number): () => number {
  let s = (Math.floor(seed * 9973) ^ 0x9e3779b9) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function r1(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

/** A smooth curve through the points (Catmull-Rom as cubic Béziers). */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/** A loop around a w×h box: a bit more than one turn, so the ends overlap instead of meeting. */
export function ovalPath(w: number, h: number, seed: number): string {
  const R = rand(seed);
  const cx = w / 2;
  const cy = h / 2;
  const rx = Math.max(4, w / 2 - 3);
  const ry = Math.max(4, h / 2 - 3);
  const start = -2.5 + R() * 0.6;
  const sweep = Math.PI * 2 * (1.1 + R() * 0.08);
  const n = 30;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + sweep * t;
    const k = 1.04 - 0.09 * t + (R() - 0.5) * 0.03;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k + (t - 0.5) * 2]);
  }
  return smoothPath(pts);
}

/** A quick underline with a short stroke back under it. */
export function underlinePath(w: number, h: number, seed: number): string {
  const R = rand(seed);
  const y = h - 4;
  const pts: Pt[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) pts.push([2 + ((w - 4) * i) / n, y + Math.sin(i * 1.3 + R() * 2) * 1.4 - i * 0.25]);
  const back = 0.35 + R() * 0.25;
  const end = pts[pts.length - 1];
  return (
    smoothPath(pts) +
    `Q${r1(end[0] + 3)} ${r1(end[1] + 1.5)} ${r1(end[0] - 6)} ${r1(y + 2.6)}` +
    `L${r1(w * (1 - back))} ${r1(y + 3.2 + R())}`
  );
}

/** A loose rectangle whose corners overshoot, like a box drawn in a hurry. */
export function boxPath(w: number, h: number, seed: number): string {
  const R = rand(seed);
  const j = () => (R() - 0.5) * 4;
  const o = 6;
  return (
    `M${r1(-o + j())} ${r1(2 + j())}L${r1(w + o + j())} ${r1(j())}` +
    `M${r1(w - 2 + j())} ${r1(-o + j())}L${r1(w + j())} ${r1(h + o + j())}` +
    `M${r1(w + o + j())} ${r1(h - 2 + j())}L${r1(-o + j())} ${r1(h + j())}` +
    `M${r1(2 + j())} ${r1(h + o + j())}L${r1(j())} ${r1(-o + j())}`
  );
}

/** A curved arrow from a to b, bent sideways by `bend` × its length. */
export function arrowPaths(a: Pt, b: Pt, bend: number, head = 9): { shaft: string; head: string } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const c: Pt = [(a[0] + b[0]) / 2 - (dy / len) * len * bend, (a[1] + b[1]) / 2 + (dx / len) * len * bend];
  const shaft = `M${r1(a[0])} ${r1(a[1])}Q${r1(c[0])} ${r1(c[1])} ${r1(b[0])} ${r1(b[1])}`;
  const ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
  const s = 0.5;
  const h1: Pt = [b[0] - Math.cos(ang - s) * head, b[1] - Math.sin(ang - s) * head];
  const h2: Pt = [b[0] - Math.cos(ang + s) * head, b[1] - Math.sin(ang + s) * head];
  return { shaft, head: `M${r1(h1[0])} ${r1(h1[1])}L${r1(b[0])} ${r1(b[1])}L${r1(h2[0])} ${r1(h2[1])}` };
}

/** The two shapes a heading underline moves between as you scroll: zig-zag → swoosh. */
export function underlineMorph(w: number, seed: number): { from: string; to: string } {
  const R = rand(seed);
  const n = 14;
  const zig: Pt[] = [];
  const swoosh: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    zig.push([4 + (w - 8) * t, 12 + (i % 2 ? -7 : 7) * (0.6 + R() * 0.5)]);
    swoosh.push([4 + (w - 8) * t, 15 - Math.sin(t * Math.PI) * 6 - t * 4]);
  }
  return { from: smoothPath(zig), to: smoothPath(swoosh) };
}

/** A slightly wobbly horizontal pen line from x1 to x2. */
export function handLine(x1: number, x2: number, y: number, seed: number): string {
  const R = rand(seed);
  const n = Math.max(2, Math.round((x2 - x1) / 22));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y + (R() - 0.5) * 3]);
  return smoothPath(pts);
}

export type Mark = { text: string; mark: "" | "under" | "oval" };

/** "plain *underlined* and [circled]" → runs. Unclosed markers stay as they are. */
export function parseMarks(s: string): Mark[] {
  const out: Mark[] = [];
  const re = /\*([^*]+)\*|\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ text: s.slice(last, m.index), mark: "" });
    out.push(m[1] != null ? { text: m[1], mark: "under" } : { text: m[2], mark: "oval" });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), mark: "" });
  return out;
}

/** Where card i lies in the loose pile before the cards are dealt out into a row. */
export function pileOffset(i: number, n: number): { x: number; y: number; r: number } {
  const R = rand(i + 7);
  return { x: (R() - 0.5) * 40, y: (R() - 0.5) * 30 - (n - i) * 2, r: (R() - 0.5) * 28 };
}
