"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Heading, PenMark, Sheet, Write } from "@/components/front/notebook";
import { useLang, useT, type Lang } from "@/lib/lang";

type Entry = {
  year: string;
  title: Record<Lang, string>;
  text: Record<Lang, string>;
  image: string;
  alt: Record<Lang, string>;
  /** Where the photo is anchored when it's cropped to 4:3 (CSS object-position). */
  focus?: string;
  /** A small handwritten note next to the year. */
  note?: Record<Lang, string>;
};

/* Peter's story, oldest first. 2019 is his own (photo from Peter, 2026-11-25). 2023 and 2026
   are worked out from the "Hej." text (FPV for 3 years, now filming for businesses) and wait
   for Peter's real years, words and photos. To add a year: put the photo in
   /public/images/tidslinje and add an entry here. */
const entries: Entry[] = [
  {
    year: "2019",
    title: { da: "Begyndte at flyve med fjernstyrede fly", en: "Started flying remote-controlled planes" },
    text: {
      da: "Det hele startede med et svævefly ude på marken. Her lærte jeg at styre med fjernbetjening, læse vinden og lande igen i ét stykke.",
      en: "It all started with a glider out in a field. That's where I learned to fly with a remote, read the wind and land in one piece.",
    },
    image: "/images/tidslinje/2019-fjernstyret-svaevefly.jpg",
    alt: {
      da: "Peter som barn holder et hvidt fjernstyret svævefly ude på en græsmark, mens det bliver gjort klar",
      en: "Peter as a kid holding a white remote-controlled glider in a grass field while it gets ready to fly",
    },
    focus: "35% 50%",
    note: { da: "det første fly", en: "the first plane" },
  },
  {
    year: "2023",
    title: { da: "Min første FPV-drone", en: "My first FPV drone" },
    text: {
      da: "Så fandt jeg FPV-dronerne og var solgt på stedet. Brillerne på, og pludselig sad jeg selv oppe i luften.",
      en: "Then I found FPV drones and was sold on the spot. Goggles on, and suddenly I was up in the air myself.",
    },
    image: "/images/peter-med-drone.jpg",
    alt: { da: "Peter med FPV-briller på hovedet og sin FPV-drone i hænderne", en: "Peter with FPV goggles on his head, holding his FPV drone" },
    focus: "50% 45%",
  },
  {
    year: "2026",
    title: { da: "Frolov FPV", en: "Frolov FPV" },
    text: {
      da: "Nu flyver jeg for virksomheder: video til sociale medier, one-takes og house tours, så de bliver set.",
      en: "Now I fly for businesses: social media videos, one-takes and house tours, so they get seen.",
    },
    image: "/projekter/pande-ram.jpg",
    alt: { da: "Stillbillede fra FPV-videoen Panoram", en: "Still from the FPV video Panoram" },
    note: { da: "her er vi nu", en: "this is now" },
  },
];

const texts = {
  da: {
    badge: "Tidslinje",
    title: "Min rejse",
    lead: "Fra et svævefly på en græsmark til FPV-video for virksomheder. Sådan er jeg kommet hertil.",
  },
  en: {
    badge: "Timeline",
    title: "My journey",
    lead: "From a glider in a grass field to FPV video for businesses. This is how I got here.",
  },
};

/* "Min rejse": a timeline of how Peter got into FPV, built on the 21st.dev TimelineBlock01
   layout (framed header, then one row per year: the year on the left, a line with a dot,
   and the story with a photo on the right) in the notebook look. The pen line runs down
   the timeline as you scroll. Sits on the "Om mig" page under the intro, and only there (Peter, 2026-11-25) (id="tidslinje"). */
export function Timeline() {
  const t = useT(texts);
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <Sheet id="tidslinje" className="mg-tl-sheet">
      <div className="mg-tl">
        <header className="mg-tl-head">
          <span className="mg-tl-badge">{t.badge}</span>
          <Heading text={t.title} seed={33} />
          <p className="mg-p mg-tl-lead">{t.lead}</p>
        </header>

        <ol ref={listRef} className="mg-tl-list">
          <span className="mg-tl-rail" aria-hidden="true">
            <motion.span className="mg-tl-rail-ink" style={{ scaleY: reduced ? 1 : progress }} />
          </span>
          {entries.map((e, i) => (
            <TimelineRow key={e.year} entry={e} index={i} />
          ))}
        </ol>

        <div className="mg-tl-foot" aria-hidden="true" />
      </div>
    </Sheet>
  );
}

function TimelineRow({ entry: e, index }: { entry: Entry; index: number }) {
  const { lang } = useLang();
  return (
    <li className="mg-tl-row" data-ink>
      <div className="mg-tl-date">
        <span className="mg-tl-dot" aria-hidden="true" />
        <span className="mg-display mg-tl-year">{e.year}</span>
        {e.note ? (
          <span className="mg-hand mg-tl-note" aria-hidden="true">
            <Write delay={0.6}>{e.note[lang]}</Write>
          </span>
        ) : null}
      </div>
      <div className="mg-tl-body">
        <h3 className="mg-tl-title">{e.title[lang]}</h3>
        <p className="mg-tl-text">{e.text[lang]}</p>
        <figure className="mg-tl-photo">
          <div className="mg-tl-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={e.image}
              alt={e.alt[lang]}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={e.focus ? { objectPosition: e.focus } : undefined}
            />
          </div>
          <PenMark kind="box" seed={70 + index * 3} padX={10} padY={10} delay={0.3} />
        </figure>
      </div>
    </li>
  );
}
