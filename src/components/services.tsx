"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { ClipViewer, type ClipSelection } from "@/components/clip-viewer";
import { Reveal } from "@/components/ui/reveal";
import { GenieLink } from "@/lib/smooth-scroll";
import { useLang, useT, type Lang } from "@/lib/lang";

/* What Peter sells to businesses: three services, each with an example clip, what the
   customer gets, who it's for and a button that opens the contact form with it chosen. */

type Service = {
  /** Used in /kontakt?ydelse=… so the form opens with this service picked. */
  slug: string;
  image: string;
  video: string;
  videoMobile?: string;
  aspect: number;
};

const media: Service[] = [
  { slug: "sociale-medier", image: "/projekter/testkorsel.jpg", video: "/clips/testkorsel.mp4", aspect: 4 / 3 },
  {
    slug: "one-take",
    image: "/projekter/pande-ram.jpg",
    video: "/clips/pande-ram.mp4",
    videoMobile: "/clips/pande-ram-720.mp4",
    aspect: 16 / 9,
  },
  {
    slug: "house-tour",
    image: "/projekter/house-tour.jpg",
    video: "/clips/house-tour.mp4",
    videoMobile: "/clips/house-tour-720.mp4",
    aspect: 4 / 3,
  },
];

const texts: Record<
  Lang,
  {
    label: string;
    title: string;
    lead: string;
    get: string;
    forWho: string;
    price: string;
    example: string;
    folder: string;
    items: { kicker: string; title: string; text: string; points: string[]; who: string }[];
  }
> = {
  da: {
    label: "Ydelser",
    title: "Det kan jeg gøre for jeres virksomhed",
    lead: "Med en FPV-drone kan kameraet flyve tæt på, ind gennem døre og hele vejen rundt. Det giver billeder, folk ikke har set før, og som får dem til at stoppe op.",
    get: "Det får I",
    forWho: "Til",
    price: "Spørg om pris",
    example: "Se eksempel",
    folder: "Ydelser",
    items: [
      {
        kicker: "Bliv set",
        title: "Indhold til sociale medier",
        text: "Korte klip, der stopper scrollet på Instagram, TikTok og Facebook. Jeg filmer jeres forretning, produkter eller event fra vinkler, ingen andre har, og leverer klippene klar til at poste.",
        points: [
          "Lodrette klip til Reels, TikTok og Shorts",
          "Vandrette versioner til hjemmeside og annoncer",
          "Klippet og klar til at lægge op",
        ],
        who: "Butikker, restauranter, bilforhandlere, events og brands",
      },
      {
        kicker: "Ét skud, ingen klip",
        title: "One-takes",
        text: "Dronen flyver igennem hele stedet i én sammenhængende tur: ind ad døren, gennem lokalerne og ud igen. Seeren får hele oplevelsen på én gang, og det er svært at kigge væk.",
        points: [
          "Ruten planlægges sammen med jer",
          "Inde og ude i samme optagelse",
          "Stærk som hovedvideo på hjemmeside og sociale medier",
        ],
        who: "Showrooms, hoteller, restauranter, fitnesscentre, fabrikker og events",
      },
      {
        kicker: "Til ejendomsmæglere",
        title: "House tours",
        text: "En flydende tur gennem boligen, inde og ude, så købere får fornemmelsen af selv at gå rundt. Det får boligen til at skille sig ud i annoncen og på sociale medier.",
        points: [
          "Hele boligen i én rolig gennemflyvning",
          "Have og omgivelser med, ikke kun rummene",
          "En lang version til annoncen og en kort til sociale medier",
        ],
        who: "Ejendomsmæglere, ejendomsvirksomheder, udlejere og boligudviklere",
      },
    ],
  },
  en: {
    label: "Services",
    title: "What I can do for your business",
    lead: "With an FPV drone the camera can fly up close, in through doors and all the way around. That gives shots people haven't seen before, and that make them stop.",
    get: "You get",
    forWho: "For",
    price: "Ask for a price",
    example: "See example",
    folder: "Services",
    items: [
      {
        kicker: "Get seen",
        title: "Social media content",
        text: "Short clips that stop the scroll on Instagram, TikTok and Facebook. I film your business, products or event from angles nobody else has, and deliver the clips ready to post.",
        points: [
          "Vertical clips for Reels, TikTok and Shorts",
          "Horizontal versions for your website and ads",
          "Edited and ready to post",
        ],
        who: "Shops, restaurants, car dealers, events and brands",
      },
      {
        kicker: "One shot, no cuts",
        title: "One-takes",
        text: "The drone flies through the whole place in one continuous run: in through the door, through the rooms and back out. Viewers get the whole experience at once, and it's hard to look away.",
        points: [
          "The route is planned together with you",
          "Inside and outside in the same shot",
          "Strong as the main video on your website and social media",
        ],
        who: "Showrooms, hotels, restaurants, gyms, factories and events",
      },
      {
        kicker: "For real estate agents",
        title: "House tours",
        text: "A smooth tour through the home, inside and out, so buyers get the feeling of walking around themselves. It makes the property stand out in the listing and on social media.",
        points: [
          "The whole home in one calm fly-through",
          "Garden and surroundings too, not just the rooms",
          "A long version for the listing and a short one for social media",
        ],
        who: "Real estate agents, property companies, landlords and developers",
      },
    ],
  },
};

function ServiceRow({
  service,
  index,
  onOpen,
}: {
  service: Service;
  index: number;
  onOpen: (el: HTMLElement) => void;
}) {
  const t = useT(texts);
  const item = t.items[index];
  const video = useRef<HTMLVideoElement>(null);

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

  // every other row has the clip on the right, so the page reads like a zig-zag
  const flip = index % 2 === 1;

  return (
    <Reveal className="grid grid-cols-1 items-center gap-7 border-b border-border py-12 md:grid-cols-2 md:gap-16 md:py-20">
      <button
        type="button"
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        onClick={(e) => onOpen(e.currentTarget)}
        aria-label={`${t.example}: ${item.title}`}
        className={`group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
          flip ? "md:order-2" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <video
          ref={video}
          src={service.video}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-1.5 text-[13px] text-foreground">
          <Play size={12} fill="currentColor" />
          {t.example}
        </span>
      </button>

      <div>
        <p className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">
          0{index + 1} · {item.kicker}
        </p>
        <h3 className="mt-3 font-serif text-[36px] leading-[1.05] md:text-[52px]">{item.title}</h3>
        <p className="mt-5 max-w-[48ch] text-[17px] leading-relaxed text-muted-foreground">{item.text}</p>

        <p className="mt-7 text-[13px] uppercase tracking-[0.14em] text-muted-foreground">{t.get}</p>
        <ul className="mt-2">
          {item.points.map((point) => (
            <li key={point} className="flex gap-3 border-b border-border py-2.5 text-[16px] last:border-b-0">
              <span aria-hidden="true">—</span>
              {point}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[15px]">
          <span className="text-muted-foreground">{t.forWho}: </span>
          {item.who}
        </p>

        <GenieLink
          href={`/kontakt?ydelse=${service.slug}`}
          className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-neutral-700"
        >
          {t.price}
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </GenieLink>
      </div>
    </Reveal>
  );
}

export function Services() {
  const t = useT(texts);
  const { lang } = useLang();
  const [clip, setClip] = useState<ClipSelection | null>(null);
  const files = media.map((m, i) => ({
    name: texts[lang].items[i].title,
    video: m.video,
    videoMobile: m.videoMobile,
    aspect: m.aspect,
    image: m.image,
  }));

  return (
    <section id="ydelser" className="mx-auto max-w-[1360px] px-5 pt-24 md:px-10 md:pt-32">
      <div className="border-b border-border pb-8 md:pb-10">
        <p className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">{t.label}</p>
        <h2 className="mt-4 max-w-[18ch] font-serif text-[44px] leading-[1.02] md:text-[72px]">{t.title}</h2>
        <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-muted-foreground">{t.lead}</p>
      </div>
      {media.map((service, i) => (
        <ServiceRow
          key={service.slug}
          service={service}
          index={i}
          onOpen={(el) => setClip({ files, index: i, folder: t.folder, origin: el })}
        />
      ))}
      <ClipViewer selection={clip} onClose={() => setClip(null)} />
    </section>
  );
}
