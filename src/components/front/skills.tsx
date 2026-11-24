"use client";

import { useState } from "react";
import { Arrow, Doodle, DOODLES, Heading, PenMark, Sheet, Write } from "@/components/front/notebook";
import { useLang, useT } from "@/lib/lang";
import { handLine, rand } from "@/lib/pen";

// Peter's own tools (2026-11-24), shown with their logos. The gear and the skills list
// below are still placeholders (gear kept simple on Peter's ask: no batteries, DJI not GoPro).
type Tool = { name: string; logo: string; note: Record<"da" | "en", string> };

const tools: Tool[] = [
  { name: "DaVinci Resolve", logo: "/images/tools/davinci-resolve.png", note: { da: "redigering af videoerne", en: "editing the videos" } },
  { name: "Betaflight", logo: "/images/tools/betaflight.png", note: { da: "opsætning af dronen", en: "setting up the drone" } },
  { name: "Gyroflow", logo: "/images/tools/gyroflow.png", note: { da: "stabilisering af de rå videofiler", en: "stabilising the raw footage" } },
  { name: "DJI", logo: "/images/tools/dji.png", note: { da: "4K-videokvalitet", en: "4K video quality" } },
];

const texts = {
  da: {
    title: "Kompetencer",
    toolNote: "jeg bliver ved med at øve mig",
    gearNote: "mit udstyr",
    gear: ["FPV-drone", "DJI-kamera", "FPV-briller"],
    intro: "Rolige, præcise ruter tæt på mennesker, biler og bygninger, og klip der passer til både hjemmesiden og de sociale medier.",
    more: "der er meget mere i værktøjskassen",
    skills: [
      "One-takes",
      "House tours",
      "Video til sociale medier",
      "Flyvning tæt på",
      "Indendørs flyvning",
      "Biler i fart",
      "Ruteplanlægning",
      "Farvekorrektion",
      "Klip til Reels og TikTok",
      "Stabilisering i Gyroflow",
      "Lyd og musik",
      "Sikker flyvning",
    ],
  },
  en: {
    title: "Skills",
    toolNote: "I'm always practising",
    gearNote: "my gear",
    gear: ["FPV drone", "DJI camera", "FPV goggles"],
    intro: "Calm, precise routes close to people, cars and buildings, and edits that fit both your website and social media.",
    more: "there's plenty more in my toolkit",
    skills: [
      "One-takes",
      "House tours",
      "Social media videos",
      "Proximity flying",
      "Indoor flying",
      "Cars at speed",
      "Route planning",
      "Colour grading",
      "Edits for Reels and TikTok",
      "Stabilisation in Gyroflow",
      "Sound and music",
      "Safe flying",
    ],
  },
};

const GEAR_COLOURS = ["#0b1f4d", "#f4f2ec", "#2453d6", "#8ab4ff", "#3b2a7a"];

/** Peter's gear as a hand-drawn stack, with a little drone sitting on top. */
function GearStack({ items }: { items: string[] }) {
  const list = items.slice(0, 7);
  const R = rand(5);
  const bh = 30;
  const base = list.length * bh + 64;
  return (
    <svg viewBox={`0 0 260 ${base + 6}`} aria-hidden="true">
      <g className="mg-ink">
        <path className="mg-draw" pathLength={1} d={handLine(6, 254, base + 2, 3)} />
      </g>
      {list.map((title, i) => {
        const w = 168 + R() * 56;
        const x = (260 - w) / 2 + (R() - 0.5) * 22;
        const y = base - (i + 1) * bh;
        const rot = (R() - 0.5) * 5;
        const color = GEAR_COLOURS[i % GEAR_COLOURS.length];
        const dark = color !== "#f4f2ec" && color !== "#8ab4ff";
        const label = title.toUpperCase();
        return (
          <g key={title} transform={`rotate(${rot.toFixed(2)} ${(x + w / 2).toFixed(1)} ${(y + bh / 2).toFixed(1)})`}>
            <rect x={x} y={y} width={w} height={bh - 3} rx={3} fill={color} stroke="rgba(0,0,0,.28)" strokeWidth={0.7} />
            <rect x={x + 9} y={y} width={4} height={bh - 3} fill={dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.12)"} />
            <rect x={x + w - 13} y={y} width={4} height={bh - 3} fill={dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.12)"} />
            <text
              x={x + w / 2}
              y={y + bh / 2 + 2}
              textAnchor="middle"
              fontSize={9}
              fill={dark ? "#f4f2ec" : "#0b1f4d"}
              textLength={Math.min(w - 42, label.length * 6.2)}
              lengthAdjust="spacingAndGlyphs"
              style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontWeight: 600, letterSpacing: ".06em" }}
            >
              {label}
            </text>
          </g>
        );
      })}
      <g className="mg-ink" transform={`translate(98 ${base - list.length * bh - 62})`}>
        {DOODLES.drone.map((d, i) => (
          <path key={i} className="mg-draw" pathLength={1} d={d} style={{ "--d": `${0.4 + i * 0.1}s` } as React.CSSProperties} />
        ))}
      </g>
    </svg>
  );
}

/* Tool tiles in a pen oval (hover one and the note under them says what it's for), a stack of
   gear and a two-column list of what Peter can do. */
export function Skills() {
  const t = useT(texts);
  const [on, setOn] = useState(-1);
  const { lang } = useLang();
  const note = on >= 0 ? `${tools[on].name}: ${tools[on].note[lang]}` : t.toolNote;
  return (
    <Sheet>
      <div className="mg-skills">
        <div className="mg-skills-top">
          <div>
            <Heading text={t.title} seed={12} />
            <div className="mg-tools" data-ink onPointerLeave={() => setOn(-1)}>
              {tools.map((tool, i) => (
                <button
                  key={tool.name}
                  type="button"
                  className="mg-tool"
                  data-on={on === i}
                  aria-label={tool.name}
                  onPointerEnter={() => setOn(i)}
                  onFocus={() => setOn(i)}
                  onBlur={() => setOn(-1)}
                  onClick={() => setOn(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tool.logo} alt="" draggable={false} />
                </button>
              ))}
              <PenMark kind="oval" seed={13} padX={6} padY={6} delay={0.3} />
            </div>
            <div className="mg-tool-note mg-hand" aria-live="polite">
              <span key={on} className="mg-note-swap">
                {note}
              </span>
            </div>
          </div>

          <div className="mg-gear" data-ink>
            <GearStack items={t.gear} />
            <div className="mg-gear-note mg-hand">
              <Write delay={0.6}>{t.gearNote}</Write>
              <svg viewBox="0 0 60 50" className="mg-ink" aria-hidden="true">
                <Arrow a={[44, 4]} b={[18, 44]} bend={-0.35} head={8} delay={0.9} />
              </svg>
            </div>
          </div>
        </div>

        <div className="mg-skills-low">
          <div>
            <p className="mg-p mg-muted">{t.intro}</p>
            <div className="mg-more mg-hand" data-ink>
              <Doodle kind="pencil" />
              <Write delay={0.5}>{t.more}</Write>
            </div>
          </div>
          <ul className="mg-skill-list">
            {t.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
