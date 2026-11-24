"use client";

import { useMemo } from "react";
import { Arrow, Heading, PenMark, Sheet, Write } from "@/components/front/notebook";
import { useT } from "@/lib/lang";
import { clamp, handLine } from "@/lib/pen";
import { qrMatrix } from "@/lib/qr";

const INSTAGRAM_URL = "https://www.instagram.com/frolovfpv/";

// TODO (Peter): placeholder content. Swap in what's true, or drop the whole section.
const texts = {
  da: {
    title: "Uddannelse",
    intro: "Det meste har jeg lært ved at flyve, crashe og flyve igen. Her er det, jeg har med i bagagen.",
    items: [
      { title: "EU-dronebevis A1/A3", sub: "Trafikstyrelsen", circled: true },
      { title: "3 år som FPV-pilot", sub: "Selvlært · 2023 – nu", circled: true },
      { title: "Mange år med fjernstyrede fly", sub: "Før FPV" },
      { title: "Videoredigering og farver", sub: "DaVinci Resolve · selvlært" },
    ],
    scan: "scan mig",
    qrNote: "min Instagram",
    langsTitle: "Sprog",
    langs: [
      { name: "Dansk", level: "modersmål", value: 1 },
      { name: "Engelsk", level: "flydende", value: 0.85 },
    ],
  },
  en: {
    title: "Education",
    intro: "Most of it I learned by flying, crashing and flying again. This is what I bring along.",
    items: [
      { title: "EU drone certificate A1/A3", sub: "Danish Civil Aviation Authority", circled: true },
      { title: "3 years as an FPV pilot", sub: "Self-taught · 2023 – now", circled: true },
      { title: "Years of RC planes", sub: "Before FPV" },
      { title: "Video editing and colour", sub: "DaVinci Resolve · self-taught" },
    ],
    scan: "scan me",
    qrNote: "my Instagram",
    langsTitle: "Languages",
    langs: [
      { name: "Danish", level: "native", value: 1 },
      { name: "English", level: "fluent", value: 0.85 },
    ],
  },
};

function QRCode({ text }: { text: string }) {
  const d = useMemo(() => {
    const g = qrMatrix(text);
    if (!g) return { n: 0, d: "" };
    let path = "";
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) if (g[y][x]) path += `M${x} ${y}h1v1h-1z`;
    return { n: g.length, d: path };
  }, [text]);
  if (!d.n) return null;
  return (
    <svg viewBox={`-2 -2 ${d.n + 4} ${d.n + 4}`} shapeRendering="crispEdges" aria-hidden="true">
      <path d={d.d} fill="#0b1f4d" />
    </svg>
  );
}

/* A list of what Peter has learned (the important ones circled in pen), a real QR code to
   his Instagram, and his languages with pen strokes out to each level. */
export function Education() {
  const t = useT(texts);
  return (
    <Sheet>
      <div className="mg-edu">
        <div>
          <Heading text={t.title} seed={11} />
          <p className="mg-p mg-muted mg-edu-intro">{t.intro}</p>
          <ul className="mg-edu-list" data-ink>
            {t.items.map((e, i) => (
              <li key={e.title}>
                <div>
                  <div className="mg-edu-t">
                    {e.circled ? (
                      <span className="mg-mk">
                        {e.title}
                        <PenMark kind="oval" seed={30 + i} padX={12} padY={7} delay={0.3 + i * 0.25} />
                      </span>
                    ) : (
                      e.title
                    )}
                  </div>
                  <div className="mg-edu-s">{e.sub}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mg-qr-wrap" data-ink>
            <a className="mg-qr" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram @frolovfpv">
              <span className="mg-qr-tag mg-hand">
                <Write delay={0.2}>{t.scan}</Write>
              </span>
              <QRCode text={INSTAGRAM_URL} />
            </a>
            <div className="mg-qr-note mg-hand">
              <svg viewBox="0 0 90 60" className="mg-ink" aria-hidden="true">
                <Arrow a={[84, 50]} b={[10, 16]} bend={-0.3} head={9} delay={0.5} />
              </svg>
              <Write delay={0.8}>{t.qrNote}</Write>
            </div>
          </div>

          <div className="mg-langs" data-ink>
            <h3 className="mg-display">{t.langsTitle}</h3>
            {t.langs.map((l, i) => (
              <div className="mg-lang" key={l.name}>
                <b>{l.name}</b>
                <span className="mg-muted">{l.level}</span>
                <svg viewBox="0 0 200 16" preserveAspectRatio="none" role="img" aria-label={`${l.name}: ${l.level}`}>
                  <path d="M2 9H198" className="mg-lang-rule" />
                  <path
                    className="mg-draw mg-lang-line"
                    pathLength={1}
                    d={handLine(2, 2 + 196 * clamp(l.value, 0.02, 1), 8.5, 40 + i)}
                    style={{ "--d": `${0.3 + i * 0.2}s`, "--dur": "1.2s" } as React.CSSProperties}
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
