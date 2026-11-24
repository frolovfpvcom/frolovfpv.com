"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ClipViewer, type ClipSelection } from "@/components/clip-viewer";
import type { FolderFile } from "@/components/ui/glass-folder-cards";
import { Arrow, Heading, Sheet, Write } from "@/components/front/notebook";
import { GenieLink } from "@/lib/smooth-scroll";
import { useLang, useT, type Lang } from "@/lib/lang";
import { clamp, pileOffset } from "@/lib/pen";

type Reel = {
  /** Still picture shown before the video plays, and while it loads. */
  image: string;
  /** The clip that plays in the phone (muted, looping). Leave out for "coming soon". */
  video?: string;
  /** Full-quality file for the big player when the phone is tapped (falls back to `video`). */
  videoLarge?: string;
  /** Width / height of the clip, for the big player. */
  aspect?: number;
  title: Record<Lang, string>;
  meta: Record<Lang, string>;
  /** A word handwritten above the phone. */
  tag: Record<Lang, string>;
};

/* Peter's videos. To add one: put the files in /public/clips and add an entry here; the row
   makes room for it on its own. */
const reels: Reel[] = [
  {
    image: "/intro-5.jpg",
    video: "/intro-5-720.mp4",
    videoLarge: "/intro-5.mp4",
    aspect: 16 / 9,
    title: { da: "Showreel", en: "Showreel" },
    meta: { da: "Det bedste fra 2026", en: "The best of 2026" },
    tag: { da: "start her", en: "start here" },
  },
  {
    image: "/projekter/pande-ram.jpg",
    video: "/clips/pande-ram-720.mp4",
    videoLarge: "/clips/pande-ram.mp4",
    aspect: 16 / 9,
    title: { da: "Panoram", en: "Panoram" },
    meta: { da: "Natur · 0:13", en: "Nature · 0:13" },
    tag: { da: "natur", en: "nature" },
  },
  {
    image: "/projekter/gennem-skoven.jpg",
    title: { da: "Gennem skoven", en: "Through the woods" },
    meta: { da: "Kommer snart", en: "Coming soon" },
    tag: { da: "snart!", en: "soon!" },
  },
];

const texts = {
  da: {
    title: "Projekter.",
    note: "Tryk på en video for at se den i stor størrelse",
    play: "Se video",
    soon: "Kommer snart",
    folder: "Projekter",
    yours: "Din virksomhed?",
    yoursLead: "Næste video kunne være jeres.",
    yoursCta: "Få et tilbud",
    yoursTag: "din tur?",
    open: "Afspil",
  },
  en: {
    title: "Projects.",
    note: "Tap a video to watch it big",
    play: "Watch",
    soon: "Coming soon",
    folder: "Projects",
    yours: "Your business?",
    yoursLead: "The next video could be yours.",
    yoursCta: "Get a quote",
    yoursTag: "your turn?",
    open: "Play",
  },
};

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Smooth start and stop for the deal (0..1 → 0..1). */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mg-phone">
      <div className="mg-phone-body">
        <div className="mg-screen">
          {children}
          <div className="mg-status" aria-hidden="true">
            <span>9:41</span>
            <span className="mg-notch" />
            <span className="mg-batt" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelScreen({ reel, lang, playing, label }: { reel: Reel; lang: Lang; playing: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      v.preload = "auto";
      v.play().catch(() => {});
    } else v.pause();
  }, [playing]);
  return (
    <PhoneFrame>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={reel.image} alt="" loading="lazy" className="mg-screen-media" draggable={false} />
      {reel.video ? (
        <video ref={ref} src={reel.video} muted loop playsInline preload="none" className="mg-screen-media" />
      ) : null}
      <div className="mg-screen-shade" />
      <div className="mg-screen-copy">
        <span className="mg-screen-title">{reel.title[lang]}</span>
        <span className="mg-screen-meta">{reel.meta[lang]}</span>
        <span className={"mg-screen-pill" + (reel.video ? "" : " mg-screen-pill-soon")}>{label}</span>
      </div>
    </PhoneFrame>
  );
}

/* "Projekter." on the dark sheet. The sheet stays put while you scroll: the phones go from a
   loose pile into a row, their numbers and tags write themselves in, and then the videos play
   while the page holds still for a moment. Tap a phone to watch the clip big. */
export function ProjectReel() {
  const t = useT(texts);
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [dealt, setDealt] = useState(false);
  const [inView, setInView] = useState(false);
  const [clip, setClip] = useState<ClipSelection | null>(null);

  const count = reels.length + 1; // the videos plus the "your business?" phone

  // Where each phone has to move to sit in the pile in the middle of the row.
  useIso(() => {
    const row = rowRef.current;
    if (!row) return;
    const place = () => {
      const cards = Array.from(row.children) as HTMLElement[];
      const cx = row.clientWidth / 2;
      const cy = row.clientHeight / 2;
      cards.forEach((card, i) => {
        const p = pileOffset(i, cards.length);
        const dx = cx - (card.offsetLeft + card.offsetWidth / 2) + p.x;
        const dy = cy - (card.offsetTop + card.offsetHeight / 2) + p.y;
        card.style.setProperty("--dx", `${dx.toFixed(1)}px`);
        card.style.setProperty("--dy", `${dy.toFixed(1)}px`);
        card.style.setProperty("--r", `${p.r.toFixed(1)}deg`);
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  // 0 when the sheet reaches the top of the screen, 1 when it's about to let go of it
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const apply = (p: number) => {
    const row = rowRef.current;
    if (!row) return;
    const e = reduced ? 1 : ease(clamp((p - 0.04) / 0.46, 0, 1));
    row.style.setProperty("--e", e.toFixed(4));
    setDealt(e > 0.97);
  };
  useMotionValueEvent(scrollYProgress, "change", apply);
  useEffect(() => apply(scrollYProgress.get()), []); // eslint-disable-line react-hooks/exhaustive-deps

  // only play while the sheet is on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playable = reels.filter((r) => r.video);
  const files: FolderFile[] = playable.map((r) => ({
    name: r.title[lang],
    meta: r.meta[lang],
    video: r.videoLarge ?? r.video,
    videoMobile: r.video,
    aspect: r.aspect,
    image: r.image,
  }));

  return (
    <div ref={sectionRef} className="mg-deal" data-reduced={reduced ? "true" : undefined}>
      <Sheet tone="night" grow className="mg-deal-sheet" id="projekter">
        <div className="mg-deal-stage">
          <div className="mg-deal-head">
            <Heading text={t.title} seed={14} />
            <div className="mg-deal-note mg-hand" data-ink>
              <Write delay={0.3}>{t.note}</Write>
              <svg viewBox="0 0 60 50" className="mg-ink" aria-hidden="true">
                <Arrow a={[40, 4]} b={[22, 46]} bend={0.3} head={8} delay={0.8} />
              </svg>
            </div>
          </div>

          <div ref={rowRef} className="mg-row" data-dealt={dealt ? "true" : undefined} style={{ "--n": count } as React.CSSProperties}>
            {reels.map((reel, i) => {
              const label = reel.video ? t.open : t.soon;
              const card = <ReelScreen reel={reel} lang={lang} playing={dealt && inView} label={label} />;
              return (
                <div className="mg-card" key={reel.image} style={{ zIndex: count - i }}>
                  <span className="mg-card-tag mg-hand" aria-hidden="true">
                    <span className="mg-card-write">{reel.tag[lang]}</span>
                    <svg viewBox="0 0 24 30" className="mg-ink">
                      <Arrow a={[12, 2]} b={[12, 27]} bend={i % 2 ? 0.25 : -0.25} head={6} />
                    </svg>
                  </span>
                  {reel.video ? (
                    <button
                      type="button"
                      className="mg-card-btn"
                      aria-label={`${t.play}: ${reel.title[lang]}`}
                      onClick={(e) =>
                        setClip({ files, index: playable.indexOf(reel), folder: t.folder, origin: e.currentTarget })
                      }
                    >
                      {card}
                    </button>
                  ) : (
                    <div className="mg-card-btn mg-card-static">{card}</div>
                  )}
                  <span className="mg-card-label mg-hand">
                    <span className="mg-card-write">
                      {i + 1}. {reel.title[lang]}
                    </span>
                  </span>
                </div>
              );
            })}

            {/* the last phone is an invitation: the next video could be theirs */}
            <div className="mg-card" style={{ zIndex: 0 }}>
              <span className="mg-card-tag mg-hand" aria-hidden="true">
                <span className="mg-card-write">{t.yoursTag}</span>
                <svg viewBox="0 0 24 30" className="mg-ink">
                  <Arrow a={[12, 2]} b={[12, 27]} bend={reels.length % 2 ? 0.25 : -0.25} head={6} />
                </svg>
              </span>
              <GenieLink href="/kontakt" className="mg-card-btn" aria-label={t.yoursCta}>
                <PhoneFrame>
                  <div className="mg-screen-yours">
                    <span className="mg-screen-title">{t.yours}</span>
                    <span className="mg-screen-lead">{t.yoursLead}</span>
                    <span className="mg-screen-pill mg-screen-pill-light">{t.yoursCta}</span>
                  </div>
                </PhoneFrame>
              </GenieLink>
              <span className="mg-card-label mg-hand">
                <span className="mg-card-write">{reels.length + 1}. ?</span>
              </span>
            </div>
          </div>
        </div>
      </Sheet>
      <ClipViewer selection={clip} onClose={() => setClip(null)} />
    </div>
  );
}
