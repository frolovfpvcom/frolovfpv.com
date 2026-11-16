"use client";

import { useRef, useState } from "react";
import { ClipViewer, type ClipSelection } from "@/components/clip-viewer";
import type { FolderFile } from "@/components/ui/glass-folder-cards";
import { Reveal } from "@/components/ui/reveal";
import { GenieLink } from "@/lib/smooth-scroll";
import { useLang, useT, type Lang } from "@/lib/lang";

type Project = {
  image: string;
  /** Plays when the mouse is over the card, and in the viewer when it's clicked. Leave out for "coming soon". */
  video?: string;
  /** A lighter copy of the video for phones, used in the viewer. */
  videoMobile?: string;
  /** Width / height of the video. */
  aspect?: number;
  title: Record<Lang, string>;
  meta: Record<Lang, string>;
  note?: Record<Lang, string>;
};

// Swap in real projects, titles and thumbnails as they come.
const projects: Project[] = [
  {
    image: "/projekter/pande-ram.jpg",
    video: "/clips/pande-ram.mp4",
    videoMobile: "/clips/pande-ram-720.mp4",
    aspect: 16 / 9,
    title: { da: "Panoram", en: "Panoram" },
    meta: { da: "Natur · 0:13", en: "Nature · 0:13" },
    note: {
      da: "Svæver igennem den lokale danske natur, der er nogle små guldklumper gemt rundt i byen",
      en: "Gliding through the local Danish countryside. There are little hidden gems all around town",
    },
  },
  {
    image: "/projekter/house-tour.jpg",
    video: "/clips/house-tour.mp4",
    videoMobile: "/clips/house-tour-720.mp4",
    aspect: 4 / 3,
    title: { da: "House tour", en: "House tour" },
    meta: { da: "Ejendom · 0:31", en: "Real estate · 0:31" },
  },
  {
    image: "/projekter/testkorsel.jpg",
    video: "/clips/testkorsel.mp4",
    aspect: 4 / 3,
    title: { da: "Testkørsel", en: "Test drive" },
    meta: { da: "Bil · 0:10", en: "Car · 0:10" },
    note: {
      da: "Test af bil på privat område. Ps det er ikke reklame for nogen som helst bil producenter",
      en: "Car test on private grounds. PS: this is not an ad for any car manufacturer",
    },
  },
  {
    image: "/projekter/gennem-skoven.jpg",
    title: { da: "Gennem skoven", en: "Through the woods" },
    meta: { da: "Natur · kommer snart", en: "Nature · coming soon" },
  },
];

const texts = {
  da: { title: "Udvalgt arbejde", all: "Se mere", folder: "Udvalgt arbejde", soon: "Kommer snart" },
  en: { title: "Selected work", all: "See more", folder: "Selected work", soon: "Coming soon" },
};

function Card({ project, lang, onOpen }: { project: Project; lang: Lang; onOpen: (el: HTMLElement) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const t = useT(texts);
  const playable = Boolean(project.video);

  const start = () => {
    const v = video.current;
    if (!v) return;
    v.preload = "auto";
    v.play().catch(() => {});
  };
  const stop = () => {
    const v = video.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title[lang]}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {playable ? (
          <video
            ref={video}
            src={project.video}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : (
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs">{t.soon}</span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-3.5 text-[15px]">
        <span>{project.title[lang]}</span>
        <span className="text-muted-foreground">{project.meta[lang]}</span>
      </div>
      {project.note ? (
        <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">{project.note[lang]}</p>
      ) : null}
    </>
  );

  if (!playable) return <div>{body}</div>;
  return (
    <button
      type="button"
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={(e) => onOpen(e.currentTarget)}
      className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      {body}
    </button>
  );
}

/* A calm grid of two columns. A clip plays when the mouse is over it, and opens big on a click. */
export function Projects() {
  const t = useT(texts);
  const { lang } = useLang();
  const [clip, setClip] = useState<ClipSelection | null>(null);
  const playable = projects.filter((p) => p.video);
  const files: FolderFile[] = playable.map((p) => ({
    name: p.title[lang],
    meta: p.meta[lang],
    video: p.video,
    videoMobile: p.videoMobile,
    aspect: p.aspect,
    image: p.image,
  }));

  return (
    <section id="projekter" className="mx-auto max-w-[1360px] px-5 pt-24 md:px-10 md:pt-32">
      <div className="mb-8 flex items-baseline justify-between border-b border-border pb-4 md:mb-10">
        <h2 className="font-serif text-[40px] leading-none md:text-[56px]">{t.title}</h2>
        <GenieLink href="/arbejde" className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
          {t.all} →
        </GenieLink>
      </div>
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 md:gap-y-14">
        {projects.map((project, i) => (
          <Reveal key={project.image} delay={(i % 2) * 0.08}>
            <Card
              project={project}
              lang={lang}
              onOpen={(el) =>
                setClip({ files, index: playable.indexOf(project), folder: t.folder, origin: el })
              }
            />
          </Reveal>
        ))}
      </div>
      <ClipViewer selection={clip} onClose={() => setClip(null)} />
    </section>
  );
}
