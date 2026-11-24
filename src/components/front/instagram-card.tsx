"use client";

import { Arrow, Write } from "@/components/front/notebook";
import { useT } from "@/lib/lang";

const INSTAGRAM_URL = "https://www.instagram.com/frolovfpv/";

const texts = {
  da: { tag: "følg mig", note: "min Instagram" },
  en: { tag: "follow me", note: "my Instagram" },
};

/** The Instagram glyph: a rounded square, the lens and the little dot. */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" />
    </svg>
  );
}

/* A tilted card with the Instagram logo in black and white; it turns into the colourful
   Instagram tile on hover or while it's pressed (like Peter's photo turns colour), with a
   handwritten "min Instagram" and an arrow pointing at it. */
export function InstagramCard() {
  const t = useT(texts);
  return (
    <div className="mg-ig-wrap" data-ink>
      <a className="mg-ig-card" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram @frolovfpv">
        <span className="mg-ig-tag mg-hand">
          <Write delay={0.2}>{t.tag}</Write>
        </span>
        <span className="mg-ig mg-ig-plain">
          <InstagramGlyph />
        </span>
        <span className="mg-ig mg-ig-colour">
          <InstagramGlyph />
        </span>
      </a>
      <div className="mg-ig-note mg-hand">
        <svg viewBox="0 0 90 60" className="mg-ink" aria-hidden="true">
          <Arrow a={[84, 50]} b={[10, 16]} bend={-0.3} head={9} delay={0.5} />
        </svg>
        <Write delay={0.8}>{t.note}</Write>
      </div>
    </div>
  );
}
